import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types.js";
import { getServerRolesList } from "../../utils/rolemanager.js";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("role")
        .setDescription("Adds or removes roles")
        .addSubcommand(subcommand => {
            return subcommand
                .setName("add")
                .setDescription("Adds a role")
                .addStringOption(option => {
                    return option
                        .setName("role")
                        .setDescription("Role to add")
                        .setRequired(true)
                        .setAutocomplete(true);
                });
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName("remove")
                .setDescription("Removes a role")
                .addStringOption(option => {
                    return option
                        .setName("role")
                        .setDescription("Role to remove")
                        .setRequired(true)
                        .setAutocomplete(true);
                });
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName("list")
                .setDescription("Lists all available roles");
        })
        .setDMPermission(false),
    autocomplete: async (interaction) => {
        try {
            if (!interaction.guild || !interaction.guild.members.cache.get(interaction.user.id)) return;

            const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
            if (!botMember) return;

            const commandName = interaction.options.getSubcommand();
            const focusedValue = interaction.options.getFocused();
            const allowed_roles = getServerRolesList(interaction.guild.id);
            const choices: { name: string, value: string }[] = [];

            if (!allowed_roles || allowed_roles.length == 0) return;

            const member = interaction.guild.members.cache.get(interaction.user.id);
            if (!member) return;

            const current_roles: string[] = [];
            member.roles.cache.forEach(role => {
                if (role.name != "@everyone" && role.comparePositionTo(botMember.roles.highest) < 0) current_roles.push(role.name);
            });

            if (commandName == "add") {
                const filtered_roles = allowed_roles
                    .filter(roleName => !focusedValue || roleName.toLowerCase().includes(focusedValue.toLowerCase()))
                    .filter(roleName => !current_roles.find(current_role => current_role.toLowerCase() == roleName.toLowerCase()))
                    .slice(0, 25);

                for (let i = 0; i < filtered_roles.length; i++) {
                    choices.push({ name: filtered_roles[i], value: filtered_roles[i] });
                }
            } else if (commandName == "remove") {
                const filtered_roles = current_roles
                    .filter(roleName => !focusedValue || roleName.toLowerCase().includes(focusedValue.toLowerCase()))
                    .filter(roleName => allowed_roles.find(allowed_role => allowed_role.toLowerCase() == roleName.toLowerCase()))
                    .slice(0, 25);

                for (let i = 0; i < filtered_roles.length; i++) {
                    choices.push({ name: filtered_roles[i], value: filtered_roles[i] });
                }
            }

            await interaction.respond(
                choices
            );
        } catch (error) {
            console.error(error);
        }
    },
    execute: async (interaction) => {
        try {
            if (!interaction.isChatInputCommand()) return;
            if (!interaction.guild) return;

            const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
            if (!botMember) return;

            const commandName = interaction.options.getSubcommand();
            const allowed_roles = getServerRolesList(interaction.guild.id);

            if (!allowed_roles || allowed_roles.length == 0) return interaction.reply({ content: "There are no available roles!", ephemeral: true });

            if (commandName == "list") {
                try {
                    await interaction.deferReply({ ephemeral: true });

                    let reply = "List of all available roles:\n```";
                    allowed_roles.forEach(roleName => {
                        if ((reply.length + 3 + roleName.length) < 2000) {
                            reply += roleName + ", ";
                        } else {
                            reply = reply.slice(0, -2) + "```";
                            interaction.followUp({ content: reply, ephemeral: true });
                            reply = "```" + roleName + ", ";
                        }
                    });
                    reply = reply.slice(0, -2) + "```";
                    return interaction.followUp({ content: reply, ephemeral: true });
                } catch (error) {
                    console.error(error);
                    return interaction.editReply({ content: "Something went wrong..." });
                }
            }

            const member = interaction.guild.members.cache.get(interaction.user.id);
            if (!member) return;

            const roleName = interaction.options.getString("role");
            if (!roleName) return interaction.reply({ content: "You need to provide a role name!", ephemeral: true });

            const role = interaction.guild.roles.cache.find(guildRole => guildRole.name.toLocaleLowerCase() == roleName.toLowerCase());
            if (!role) return interaction.reply({ content: "You need to provide a valid role name!", ephemeral: true });

            if (role.name == "@everyone" || !allowed_roles.find(allowed_role => allowed_role.toLowerCase() == roleName.toLowerCase())) {
                return interaction.reply({ content: "This role is not allowed!", ephemeral: true });
            }

            const current_roles = member.roles.cache;

            if (commandName == "add") {
                if (role.comparePositionTo(botMember.roles.highest) > 0) {
                    return interaction.reply({ content: `${botMember.displayName} does not have enough permissions to add this role!`, ephemeral: true });
                }

                if (current_roles.get(role.id)) return interaction.reply({ content: "You already have this role!", ephemeral: true });

                await member.roles.add(role);
                interaction.reply(`Role added: ${role.name}`);
            } else if (commandName == "remove") {
                if (role.comparePositionTo(botMember.roles.highest) > 0) {
                    return interaction.reply({ content: `${botMember.displayName} does not have enough permissions to remove this role!`, ephemeral: true });
                }

                if (!current_roles.get(role.id)) return interaction.reply({ content: "You do not have this role!", ephemeral: true });

                await member.roles.remove(role);
                interaction.reply(`Role removed: ${role.name}`);
            } else {
                interaction.reply({ content: "Something went wrong...", ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            interaction.reply({ content: "Something went wrong...", ephemeral: true });
        }
    },
    cooldown: 10
};

export default command;