require('dotenv').config();
const chalk = require('chalk');
const fs = require('fs');

const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Client: SelfbotClient } = require("discord.js-selfbot-v13");
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
        console.log(chalk.blue('🔄 Started refreshing application (/) commands.'));
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands },
        );
        console.log(chalk.green('✅ Successfully reloaded application (/) commands.'));
    } catch (error) {
        console.error(chalk.red('❌ Error refreshing commands:'), error);
    }
}

async function checkToken(token) {
    const selfbotClient = new SelfbotClient({
        checkUpdate: false,
    });

    try {
        await selfbotClient.login(token);
    } catch (error) {
        console.log(chalk.red(`❌ Token: ${token.slice(0, 20)}... is invalid!`));
        invalidTokens.push(token);
        totalScanned++;
        return;
    }

    const user = selfbotClient.user;
    if (user) {
        console.log(chalk.green(`\n✅ Token: ${token.slice(0, 20)}... is valid!`));
        console.log(chalk.blue(`👤 Username: ${user.tag}`));
        console.log(chalk.blue(`🆔 User ID: ${user.id}`));
        console.log(chalk.blue(`📧 Email Verified: ${user.verified ? "✅ Yes" : "❌ No"}`));
        console.log(chalk.blue(`🔒 2FA Enabled: ${user.mfaEnabled ? "✅ Yes" : "❌ No"}`));
        console.log(chalk.blue(`📱 Phone Verified: ${user.phone ? "✅ Yes" : "❌ No"}`));
        console.log(chalk.blue(`📅 Join Date: ${user.createdAt.toISOString()}`));

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
            console.log(chalk.magenta(`💎 Nitro Status: ${nitroStatus}`));
        } else {
            console.log(chalk.gray("💎 Nitro Status: Inactive"));
        }

        const accountAge = moment().diff(moment(user.createdAt), 'days');
        console.log(chalk.blue(`📅 Account Age: ${accountAge} days`));

        let boostsAvailable = 0;
        try {
            const response = await axios.get("https://discord.com/api/v9/users/@me/guilds/premium/subscription-slots", {
                headers: {
                    Authorization: token,
                },
            });

            boostsAvailable = response.data.filter(slot => slot.cooldown_ends_at === null).length;
            console.log(chalk.blue(`🚀 Boosts Available (API): ${boostsAvailable}`));
        } catch (error) {
            console.log(chalk.red("❌ Failed to fetch boost information from API."));
        }

        const canBoost = nitroStatus !== "Inactive" && boostsAvailable > 0;
        if (canBoost) {
            console.log(chalk.green("✅ This token CAN boost a server."));
            canBoostCount++;
        } else {
            console.log(chalk.red("❌ This token CANNOT boost a server."));
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
        console.log(chalk.red("❌ Failed to fetch user information."));
    }

    totalScanned++;

    selfbotClient.destroy();
}

function splitIntoPages(tokens, pageSize) {
    const pages = [];
    for (let i = 0; i < tokens.length; i += pageSize) {
        pages.push(tokens.slice(i, i + pageSize));
    }
    return pages;
}

function formatToken(token) {
    const parts = token.split('@');
    if (parts.length < 2) {
        return token;
    }

    const tokenPart = parts[parts.length - 1].split(':').pop();
    return tokenPart;
}

client.once('ready', async () => {
    console.log(chalk.green(`✅ Logged in as ${client.user.tag}`));
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

        const response = await axios.get(attachment.url);
        const tokens = response.data.split("\n").filter(token => token.trim());

        const formattedTokens = tokens.map(token => formatToken(token.trim()));

        fs.writeFile('formattedtokens.txt', formattedTokens.join('\n'), (err) => {
            if (err) {
                console.error(chalk.red('❌ Error writing formatted tokens to file:'), err);
            } else {
                console.log(chalk.green('✅ Formatted tokens saved to "formattedtokens.txt".'));
            }
        });

        const createSummaryEmbed = (currentNitroPage = 0, currentNonNitroPage = 0, currentInvalidPage = 0) => {
            const nitroTokens = validTokens.filter(t => t.nitroStatus !== "Inactive");
            const nonNitroTokens = validTokens.filter(t => t.nitroStatus === "Inactive");

            const nitroTokensPages = splitIntoPages(nitroTokens, 9);
            const nonNitroTokensPages = splitIntoPages(nonNitroTokens, 9);
            const invalidTokensPages = splitIntoPages(invalidTokens, 9);

            return new EmbedBuilder()
                .setColor('#0000FF')
                .setTitle('Discord Token Checker')
                .addFields(
                    {
                        name: '✅ [💎] Valid Tokens (Nitro):',
                        value: nitroTokensPages[currentNitroPage]?.map(t => `- Valid [NITRO] [BOOSTS: ${t.boostsAvailable}] [AGE: ${t.accountAge}] [EV: ${t.emailVerified}] [PV: ${t.phoneVerified}] – ${t.token.slice(0, 20)}***********`).join('\n') || 'None',
                        inline: false
                    },
                    {
                        name: '✅ Valid Tokens (Non Nitro):',
                        value: nonNitroTokensPages[currentNonNitroPage]?.map(t => `- Valid [AGE: ${t.accountAge}] [EV: ${t.emailVerified}] [PV: ${t.phoneVerified}] – ${t.token.slice(0, 20)}***********`).join('\n') || 'None',
                        inline: false
                    },
                    {
                        name: '❌ Invalid Tokens:',
                        value: invalidTokensPages[currentInvalidPage]?.map(t => `- Invalid – ${t.slice(0, 20)}***********`).join('\n') || 'None',
                        inline: false
                    }
                );
        };

        const previousButton = new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        const nextButton = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        const sendSummaryButton = new ButtonBuilder()
            .setCustomId('send_summary')
            .setLabel('Send Summary to DM')
            .setStyle(ButtonStyle.Success);

        const actionRow = new ActionRowBuilder().addComponents(previousButton, nextButton, sendSummaryButton);

        let message = await interaction.followUp({ embeds: [createSummaryEmbed()], components: [actionRow] });

        for (const token of formattedTokens) {
            await checkToken(token.trim());
            await new Promise(resolve => setTimeout(resolve, 1));

            await message.edit({ embeds: [createSummaryEmbed()], components: [actionRow] });
        }

        console.log(chalk.green('✅ Done checking tokens!'));

        const nitroTokensContent = validTokens.filter(t => t.nitroStatus !== "Inactive").map(t => t.token).join('\n');
        const nonNitroTokensContent = validTokens.filter(t => t.nitroStatus === "Inactive").map(t => t.token).join('\n');
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

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'send_summary') {
                await i.deferUpdate();
                await interaction.user.send({ embeds: [createSummaryEmbed()] });
                await i.followUp({ content: 'Summary sent to your DMs!', ephemeral: true });
            }
        });

        await interaction.editReply({ content: 'Token checking completed. Check your DMs for the results.' });
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
