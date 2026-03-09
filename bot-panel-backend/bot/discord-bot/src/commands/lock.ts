export const lockChannel = async (message) => {
    const channel = message.channel;

    // Check if the channel is already locked
    if (channel.permissionsFor(channel.guild.roles.everyone).has("SEND_MESSAGES")) {
        await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
            SEND_MESSAGES: false,
        });

        await message.channel.send("This channel has been locked.");
    } else {
        await message.channel.send("This channel is already locked.");
    }
};