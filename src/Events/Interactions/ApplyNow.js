const {
  ActionRowBuilder,
  ButtonBuilder,
  TextInputBuilder,
  ModalBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { getTags } = require("../../Utils/Functions");

async function sendApplication(interaction, client, guild, member, data) {
  let db = client.db;
  const logChannel = guild.channels.cache.get("1424177873991766176");
  if (!logChannel)
    return interaction.reply({
      content: `**${client.emoji.failed} Application log channel not found. Please contact the server administrator.**`,
      flags: [64],
    });

  await interaction
    .update({
      content: `**${client.emoji.loading} Sending your application...**`,
      components: [],
    })
    .catch(() => {});

  const embed = new EmbedBuilder()
    .setTitle(`${member.user.username}'s Application`)
    .setColor(guild.members.me.displayHexColor)
    .setThumbnail(member.user.displayAvatarURL())
    .addFields(
      { name: "Full Name", value: `\`\`\`${data.fullName}\`\`\`` },
      { name: "Age", value: `\`\`\`${data.age}\`\`\`` },
      { name: "Country", value: `\`\`\`${data.country}\`\`\`` },
      {
        name: "Specialization & Skills",
        value: `\`\`\`${data.specializationSkills}\`\`\``,
      },
      {
        name: "Portfolio / Work Links",
        value: `\`\`\`${data.portfolio}\`\`\``,
      },
      { name: "Why should we accept you?", value: `\`\`\`${data.why}\`\`\`` },
      { name: "Apply Type", value: `\`\`\`${data.roleLabel.type}\`\`\`` }
    )
    .setTimestamp();

  if (data.roleLabel.roles.length > 0) {
    embed.addFields({
      name: `Developer Roles (${data.roleLabel.roles.length})`,
      value: `\`\`\`${data.roleLabel.roles
        .map((id) => guild.roles.cache.get(id)?.name)
        .join(", ")}\`\`\``,
    });
  }

  let rowButs = new ActionRowBuilder({
    components: [
      new ButtonBuilder({
        customId: `acceptApply`,
        label: `Accept`,
        emoji: client.emoji.done,
        style: 3,
      }),

      new ButtonBuilder({
        customId: `rejectApply`,
        label: `Reject`,
        emoji: client.emoji.failed,
        style: 4,
      }),

      new ButtonBuilder({
        customId: `infoApply`,
        label: `Info`,
        emoji: `<:n_openfolder:1431069462362194061>`,
        style: 1,
      }),

      new ButtonBuilder({
        customId: `deleteApply`,
        label: `Delete`,
        emoji: "<:n_delete:1431067505136505006>",
        style: 4,
      }),

      new ButtonBuilder({
        customId: `blacklistApply`,
        label: `Blacklist`,
        emoji: client.emoji.error,
        style: 2,
      }),
    ],
  });

  await interaction.editReply({
    content: `**${client.emoji.done} Your application has been sent successfully.**`,
    components: [],
  });

  let msg = await logChannel.send({ embeds: [embed], components: [rowButs] });
  await db.push(`applications_${guild.id}`, {
    userId: member.id,
    applyId: msg.id,
    date: Date.now(),
    blacklist: false,
    status: "Pending",
    ...data,
  });
}

module.exports = {
  name: "interactionCreate",

  /**
   * @param {import("discord.js").Interaction} interaction
   * @param {import("discord.js").Client} client
   */
  run: async (client, interaction) => {
    const { guild, member, customId, fields, message } = interaction;
    if (interaction.isButton() && customId == "applyButton") {
      let db = client.db;
      let getData = (await db.get(`applications_${guild.id}`)) || [];
      let appData = getData?.find((d) => d?.userId === member.id);

      if (appData?.blacklist)
        return interaction.reply({
          content: `**${client.emoji.failed} You are blacklisted from applying. Please contact the server administrator.**`,
          flags: [64],
        });

      if (appData?.status === "Pending")
        return interaction.reply({
          content: `**${client.emoji.failed} You already have a pending application.\n-# ${client.emoji.loading} Please wait for it to be reviewed before applying again.**`,
          flags: [64],
        });

      let content = `## <:n_rules:1431067280346714132> Seller Application Rules
> Please read these rules carefully before applying — any violation may result in your application being denied or your access being permanently removed.

### Eligibility Requirements
<:n_one:1431092184421105664> You must be **active and engaged** within the server.
<:n_two:1431092181531103232> Submitting **multiple applications** or spamming = instant rejection.
<:n_three:1431092178565988404> All submitted work must be **original** — stolen or copied work will lead to a permanent ban.
<:n_four:1431092176527298672> You must be **15 years old or above**.
<:n_five:1431092174581141627> Once accepted, you agree to the **management’s commission policy** on completed sales.
<:n_six:1431092173088100414> All information provided must be **accurate and complete** — fake data will cause an instant denial.

### After Getting Accepted
<:n_one:1431092184421105664> You are **not allowed** to handle client deals outside the official ticket channels.
<:n_two:1431092181531103232> Always work **within the server** to ensure protection for both you and the client.
<:n_three:1431092178565988404> The management reserves the right to **remove your seller role** if your performance or behavior is unacceptable.
<:n_four:1431092176527298672> Never start a project **without a clear agreement** in the ticket chat.
<:n_five:1431092174581141627> Offering or advertising **illegal or ToS-breaking services** (e.g. hacks, spam, tokens, etc.) is strictly forbidden.
<:n_six:1431092173088100414> Put the __full__ link to server in your bio | https://discord.gg/Nexode

### Administrative Notes
- Applications are reviewed within **24–72 hours**.
- If accepted, you’ll be contacted by the staff or receive an automated confirmation.
- The management reserves the right to **decline any application without explanation**.`;
      let rowButs = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("applyNext")
          .setLabel("Next")
          .setEmoji(client.emoji.done)
          .setStyle(3),

        new ButtonBuilder()
          .setCustomId("cancelApply")
          .setEmoji(client.emoji.failed)
          .setLabel("Cancel")
          .setStyle(4)
      );

      let msg = await interaction.reply({
        content,
        components: [rowButs],
        flags: [64],
        fetchReply: true,
      });
      let c = msg.createMessageComponentCollector({
        componentType: 2,
      });

      c.on("collect", async (i) => {
        if (i.customId === "applyNext") {
          let fullNameRow = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("fullNameInput")
              .setLabel("Full Name")
              .setPlaceholder("Ex: Ahmed Mohamed")
              .setStyle(1)
          );

          let ageCountryRow = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("ageCountryInput")
              .setLabel("Age & Country")
              .setPlaceholder("Ex: 16 - Egypt")
              .setStyle(1)
          );

          let specializationSkillsRow = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("specializationSkillsInput")
              .setLabel("Specialization & Skills")
              .setPlaceholder(
                "Ex: Frontend Developer\nReact, Node.js, TailwindCSS, Discord.js"
              )
              .setStyle(2)
          );

          let portfolioRow = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("portfolioInput")
              .setLabel("Portfolio / Work Links")
              .setPlaceholder(
                "Ex: GitHub: github.com/ahmeddev\nProject 1: https://example.com"
              )
              .setStyle(2)
          );

          let whyRow = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("whyInput")
              .setLabel("Why should we accept you?")
              .setPlaceholder(
                "Ex: Explain why you think you'd be a great fit as a seller here."
              )
              .setStyle(2)
          );

          let m = new ModalBuilder()
            .setCustomId("applyModal")
            .setTitle("Nexode Seller Application")
            .addComponents(
              fullNameRow,
              ageCountryRow,
              specializationSkillsRow,
              portfolioRow,
              whyRow
            );

          await i.showModal(m);
        } else if (i.customId === "cancelApply") {
          await interaction.deleteReply().catch(() => {});
        }
      });
    } else if (interaction.isModalSubmit() && customId === "applyModal") {
      const fullName = fields.getTextInputValue("fullNameInput");
      const ageCountry = fields.getTextInputValue("ageCountryInput");
      const specializationSkills = fields.getTextInputValue(
        "specializationSkillsInput"
      );
      const portfolio = fields.getTextInputValue("portfolioInput");
      const why = fields.getTextInputValue("whyInput");

      if (ageCountry.includes("-")) {
        [age, country] = ageCountry.split("-").map((x) => x.trim());
      } else {
        const parts = ageCountry.split(/\s+/);
        age = parts[0] || null;
        country = parts.slice(1).join(" ") || null;
      }

      if (!age || !country) {
        return interaction.reply({
          content: `**${client.emoji.failed} Please provide both your age and country in the "Age & Country" field, separated by a hyphen (-) or space.**`,
          flags: [64],
        });
      }

      await interaction.update({
        content: null,
        components: [
          new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("applyType")
              .setPlaceholder("Select your apply type")
              .addOptions([
                {
                  label: "Developer",
                  value: "developer",
                  emoji: "<:n_code:1431066609690083419>",
                  description: "Apply as a developer / programmer",
                },
                {
                  label: "Designer",
                  value: "designer",
                  emoji: "<:n_paint:1431067229444898826>",
                  description: "Apply as a designer / artist",
                },
              ])
          ),
        ],
      });

      const msg = await interaction.fetchReply();
      const collector = msg.createMessageComponentCollector({
        componentType: 3,
        filter: (i) => i.user.id === interaction.user.id,
        time: 60000,
      });

      collector.on("collect", async (i) => {
        const type = i.values[0];
        if (type === "developer") {
          let tags = getTags(
            guild,
            "1424177779490033736",
            "1429111595958669312",
            ["Verified Seller", "Staff", "Trial Staff"],
            "Name"
          );

          if (!tags.length) {
            return interaction.reply({
              content: `**${client.emoji.failed} No roles were found between the specified roles.**`,
              flags: [64],
            });
          }

          await i.update({
            content: null,
            components: [
              new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId("devSection")
                  .setPlaceholder("Select your developer section")
                  .setMinValues(1)
                  .setMaxValues(tags.length)
                  .addOptions(
                    tags.map((role) => ({
                      label: role.name,
                      emoji: "💻",
                      value: role.id,
                    }))
                  )
              ),
            ],
          });

          const sectionCollector = msg.createMessageComponentCollector({
            componentType: 3,
            filter: (i) => i.user.id === interaction.user.id,
          });

          sectionCollector.on("collect", async (sec) => {
            const section = sec.values.map((s) => s);
            sectionCollector.stop();
            collector.stop();

            await sendApplication(sec, client, guild, member, {
              fullName,
              age,
              country,
              specializationSkills,
              portfolio,
              why,
              roleLabel: { type: "Developer", roles: section },
            });
          });
        } else if (type === "designer") {
          collector.stop();
          await sendApplication(i, client, guild, member, {
            fullName,
            age,
            country,
            specializationSkills,
            portfolio,
            why,
            roleLabel: { type: "Designer", roles: [] },
          });
        }
      });

      collector.on("end", async (_, reason) => {
        if (reason === "time") {
          await interaction.editReply({
            content: `**${client.emoji.failed} Application timed out.**`,
            components: [],
          });
        }
      });
    }
  },
};
