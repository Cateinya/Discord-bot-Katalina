import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types.js";
import { addServerRole, deleteServerRole, getServerRolesList } from "../../utils/rolemanager.js";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("role_allow")
        .setDescription("Allows or denies the self-assignment of roles")
        .addSubcommand(subcommand => {
            return subcommand
                .setName("add")
                .setDescription("Allows a role to be self-assigned by users")
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
                .setDescription("Removes a role from the self-assignable list")
                .addStringOption(option => {
                    return option
                        .setName("role")
                        .setDescription("Role to remove")
                        .setRequired(true)
                        .setAutocomplete(true);
                });
        })
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    autocomplete: async (interaction) => {
        try {
            if (!interaction.guild || !interaction.guild.members.cache.get(interaction.user.id)) return;

            const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
            if (!botMember) return;

            const commandName = interaction.options.getSubcommand();
            const focusedValue = interaction.options.getFocused();
            const server_id = interaction.guild.id;
            const allowed_roles = getServerRolesList(server_id);
            const choices: { name: string, value: string }[] = [];

            if (commandName == "add") {
                const server_roles: string[] = [];
                interaction.guild.roles.cache.forEach(role => {
                    if (role.name != "@everyone" && role.comparePositionTo(botMember.roles.highest) < 0) server_roles.push(role.name);
                });

                const filtered_roles = server_roles
                    .filter(roleName => !focusedValue || roleName.toLowerCase().includes(focusedValue.toLowerCase()))
                    .filter(roleName => !allowed_roles || !allowed_roles.find(allowed_role => allowed_role.toLowerCase() == roleName.toLowerCase()))
                    .slice(0, 25);

                for (let i = 0; i < filtered_roles.length; i++) {
                    choices.push({ name: filtered_roles[i], value: filtered_roles[i] });
                }
            } else if (commandName == "remove") {
                if (allowed_roles && allowed_roles.length > 0) {
                    const filtered_roles = allowed_roles
                        .filter(roleName => !focusedValue || roleName.toLowerCase().includes(focusedValue.toLowerCase()))
                        .slice(0, 25);

                    for (let i = 0; i < filtered_roles.length; i++) {
                        choices.push({ name: filtered_roles[i], value: filtered_roles[i] });
                    }
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

            const server_id = interaction.guild.id;

            const roleName = interaction.options.getString("role");
            if (!roleName) return interaction.reply({ content: "You need to provide a role name!", ephemeral: true });

            const allowed_roles = getServerRolesList(server_id);

            const commandName = interaction.options.getSubcommand();

            if (commandName == "add") {
                const role = interaction.guild.roles.cache.find(guildRole => guildRole.name.toLocaleLowerCase() == roleName.toLowerCase());
                if (!role) return interaction.reply({ content: "You need to provide a valid role name!", ephemeral: true });

                if (allowed_roles && allowed_roles.includes(role.name)) return interaction.reply({ content: "This role is already in the allowed list!", ephemeral: true });

                if (role.name == "@everyone" || role.comparePositionTo(botMember.roles.highest) > 0) {
                    return interaction.reply({ content: "This role cannot be added in the allowed list!", ephemeral: true });
                }

                addServerRole(server_id, role.name);

                interaction.reply(`Role added to the allowed list: ${role.name}`);
            } else if (commandName == "remove") {
                if (!allowed_roles || allowed_roles.indexOf(roleName) == -1) return interaction.reply({ content: "This role is not in the allowed list!", ephemeral: true });

                deleteServerRole(server_id, roleName);

                interaction.reply(`Role removed from the allowed list: ${roleName}`);
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