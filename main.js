require('dotenv').config();

const { Client: SelfbotClient } = require("discord.js-selfbot-v13");
const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const axios = require("axios");
const moment = require("moment");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
    partials: ['CHANNEL']
});

let validTokens = [];
let invalidTokens = [];

let totalScanned = 0;
let emailConnected = 0;
let phoneConnected = 0;
let bothConnected = 0;
let twoFAEnabled = 0;
let nitroCount = 0;
let boostAvailableCount = 0;
let canBoostCount = 0;

const commands = [
    {
        name: 'check_tokens',
        description: 'Upload a file containing tokens to check their validity.',
        options: [
            {
                name: 'file',
                description: 'The file containing tokens.',
                type: 11,
                required: true,
            },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

async function registerCommands() {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

async function checkToken(token) {
    const selfbotClient = new SelfbotClient({
        checkUpdate: false,
    });

    try {
        await selfbotClient.login(token);
    } catch (error) {
        console.log(`Token: ${token.slice(0, 20)}... is invalid!`);
        invalidTokens.push(token);
        totalScanned++;
        return;
    }

    const user = selfbotClient.user;
    if (user) {
        console.log(`\nToken: ${token.slice(0, 20)}... is valid!`);
        console.log(`Username: ${user.tag}`);
        console.log(`User ID: ${user.id}`);
        console.log(`Email Verified: ${user.verified ? "Yes" : "No"}`);
        console.log(`2FA Enabled: ${user.mfaEnabled ? "Yes" : "No"}`);
        console.log(`Phone Verified: ${user.phone ? "Yes" : "No"}`);
        console.log(`Join Date: ${user.createdAt.toISOString()}`);

        if (user.verified) emailConnected++;
        if (user.phone) phoneConnected++;
        if (user.verified && user.phone) bothConnected++;
        if (user.mfaEnabled) twoFAEnabled++;

        const nitroTypes = {
            1: "Nitro Classic",
            2: "Nitro",
            3: "Nitro Basic"
        };
        const nitroStatus = nitroTypes[user.premiumType] || "Inactive";
        if (nitroStatus !== "Inactive") {
            nitroCount++;
            console.log(`Nitro Status: ${nitroStatus}`);
        } else {
            console.log("Nitro Status: Inactive");
        }

        const accountAge = moment().diff(moment(user.createdAt), 'days');

        let boostsAvailable = 0;
        try {
            const response = await axios.get("https://discord.com/api/v9/users/@me/guilds/premium/subscription-slots", {
                headers: {
                    Authorization: token,
                },
            });

            boostsAvailable = response.data.filter(slot => slot.cooldown_ends_at === null).length;
            console.log(`Boosts Available (API): ${boostsAvailable}`);
        } catch (error) {
            console.log("Failed to fetch boost information from API.");
        }

        const canBoost = nitroStatus !== "Inactive" && boostsAvailable > 0;
        if (canBoost) {
            console.log("This token CAN boost a server.");
            canBoostCount++;
        } else {
            console.log("This token CANNOT boost a server.");
        }

        validTokens.push({
            token: token,
            username: user.tag,
            userId: user.id,
            emailVerified: user.verified,
            twoFAEnabled: user.mfaEnabled,
            phoneVerified: user.phone,
            joinDate: user.createdAt.toISOString(),
            nitroStatus: nitroStatus,
            accountAge: accountAge,
            boostsAvailable: boostsAvailable,
            canBoost: canBoost,
        });
    } else {
        console.log("Failed to fetch user information.");
    }

    totalScanned++;

    selfbotClient.destroy();
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await registerCommands();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'check_tokens') {
        const attachment = interaction.options.getAttachment('file');
        if (!attachment || !attachment.name.endsWith('.txt')) {
            await interaction.reply({ content: 'Please upload a valid .txt file.' });
            return;
        }

        await interaction.deferReply();

        validTokens = [];
        invalidTokens = [];
        totalScanned = 0;
        emailConnected = 0;
        phoneConnected = 0;
        bothConnected = 0;
        twoFAEnabled = 0;
        nitroCount = 0;
        boostAvailableCount = 0;
        canBoostCount = 0;

        let summaryEmbed = new EmbedBuilder()
            .setColor('#0000FF')
            .setTitle('Discord Token Checker')
            .setDescription('Checking tokens...')
            .addFields(
                { name: '✅ [💎] Valid Tokens (Nitro) :', value: 'None', inline: false },
                { name: '✅ Valid Tokens (Non Nitro):', value: 'None', inline: false },
                { name: '❌ Invalid Tokens:', value: 'None', inline: false }
            );

        const sendSummaryButton = new ButtonBuilder()
            .setCustomId('send_summary')
            .setLabel('Send Summary to DM')
            .setStyle(ButtonStyle.Primary);

        const actionRow = new ActionRowBuilder().addComponents(sendSummaryButton);

        let message;
        if (interaction.channel) {
            message = await interaction.followUp({ embeds: [summaryEmbed], components: [actionRow] });
        } else {
            message = await interaction.user.send({ embeds: [summaryEmbed], components: [actionRow] });
        }

        const response = await axios.get(attachment.url);
        const tokens = response.data.split("\n").filter(token => token.trim());

        for (const token of tokens) {
            await checkToken(token.trim());
            await new Promise(resolve => setTimeout(resolve, 1));

            const nitroTokens = validTokens.filter(t => t.nitroStatus !== "Inactive");
            const nonNitroTokens = validTokens.filter(t => t.nitroStatus === "Inactive");

            summaryEmbed = new EmbedBuilder()
                .setColor('#0000FF')
                .setTitle('Discord Token Checker')
                .addFields(
                    {
                        name: '✅ [💎] Valid Tokens (Nitro):',
                        value: nitroTokens.map(t => `- Valid [NITRO] [BOOSTS: ${t.boostsAvailable}] [AGE: ${t.accountAge}] [EV: ${t.emailVerified}] [PV: ${t.phoneVerified}] – ${t.token.slice(0, 20)}***********`).join('\n') || 'None',
                        inline: false
                    },
                    {
                        name: '✅ Valid Tokens (Non Nitro):',
                        value: nonNitroTokens.map(t => `- Valid [AGE: ${t.accountAge}] [EV: ${t.emailVerified}] [PV: ${t.phoneVerified}] – ${t.token.slice(0, 20)}***********`).join('\n') || 'None',
                        inline: false
                    },
                    {
                        name: '❌ Invalid Tokens:',
                        value: invalidTokens.map(t => `- Invalid – ${t.slice(0, 20)}***********`).join('\n') || 'None',
                        inline: false
                    }
                );

            if (interaction.channel) {
                await message.edit({ embeds: [summaryEmbed], components: [actionRow] });
            } else {
                await message.edit({ embeds: [summaryEmbed], components: [actionRow] });
            }
        }

        const nitroTokens = validTokens.filter(t => t.nitroStatus !== "Inactive");
        const nonNitroTokens = validTokens.filter(t => t.nitroStatus === "Inactive");

        const nitroTokensContent = nitroTokens.map(t => t.token).join('\n');
        const nonNitroTokensContent = nonNitroTokens.map(t => t.token).join('\n');
        const invalidTokensContent = invalidTokens.join('\n');

        const nitroTokensBuffer = Buffer.from(nitroTokensContent, 'utf-8');
        const nonNitroTokensBuffer = Buffer.from(nitroTokensContent, 'utf-8');
        const invalidTokensBuffer = Buffer.from(invalidTokensContent, 'utf-8');

        const nitroTokensAttachment = new AttachmentBuilder(nitroTokensBuffer, { name: 'nitro_tokens.txt' });
        const nonNitroTokensAttachment = new AttachmentBuilder(nonNitroTokensBuffer, { name: 'non_nitro_tokens.txt' });
        const invalidTokensAttachment = new AttachmentBuilder(invalidTokensBuffer, { name: 'invalid_tokens.txt' });

        await interaction.user.send({
            files: [nitroTokensAttachment, nonNitroTokensAttachment, invalidTokensAttachment],
            content: 'Here are the valid and invalid tokens:'
        });

        const filter = (i) => i.customId === 'send_summary' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            await i.deferUpdate();
            await interaction.user.send({ embeds: [summaryEmbed] });
            await i.followUp({ content: 'Summary sent to your DMs!', ephemeral: true });
        });

        await interaction.editReply({ content: 'Token checking completed. Check your DMs for the results.' });
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);