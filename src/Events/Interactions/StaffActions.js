const {
  ActionRowBuilder,
  TextInputBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const sellerschema = require("../../Database/sellers");
const {
  isValidURL,
  isValidImageURL,
  getEmojiCustom,
} = require("../../Utils/Functions");

module.exports = {
  name: "interactionCreate",

  /**
   * @param {import("discord.js").StringSelectMenuInteraction} interaction
   * @param {import("discord.js").Client} client
   */
  run: async (client, interaction) => {
    const { guild, member, fields, customId, values } = interaction;
    if (interaction.isStringSelectMenu() && customId === "staffActionsMenu") {
      if (values[0] === "addProject") {
        const typeRow = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("projectType")
            .setLabel("Project Type")
            .setPlaceholder(`Ex: Programming/Design`)
            .setStyle(1)
        );

        const titleRow = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("projectTitle")
            .setLabel("Project Title")
            .setPlaceholder(`Ex: Nexode Website`)
            .setStyle(1)
        );

        const descRow = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("projectDescription")
            .setLabel("Project Description")
            .setPlaceholder(
              "Ex: Another website I programmed for one of my clients"
            )
            .setStyle(2)
        );

        const linksRow = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("projectLinks")
            .setLabel("Links (Not required)")
            .setStyle(1)
            .setRequired(false)
            .setPlaceholder(
              "Ex: View Project (Required), Open Source (Not required)"
            )
        );

        const imagesRow = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("projectImages")
            .setLabel("Image URL (Not required)")
            .setStyle(1)
            .setPlaceholder("Ex: https://i.imgur.com/ZKbU6PX.jpeg")
            .setRequired(false)
        );

        let model = new ModalBuilder()
          .setCustomId(`addProjectModal`)
          .setTitle("Add New Project")
          .addComponents(typeRow, titleRow, descRow, linksRow, imagesRow);

        await interaction.showModal(model);
      }

      if (values[0] === "removeProject") {
        let sellerData = await sellerschema.findOne({ sellerId: member.id });
        if (!sellerData)
          return interaction.reply({
            content: `${client.emoji.failed} No portfolio found for **@${member.user.username}**.`,
            components: [],
            flags: [64],
          });

        if (!sellerData.projects === 0 || !sellerData.projects.length)
          return interaction.reply({
            content: `**${client.emoji.failed} No projects found**`,
            components: [],
            flags: [64],
          });

        let projectsList = sellerData.projects.map((project, i) => ({
          label: `#${i + 1} ${project.title}`,
          description: `Type: ${project.type} | Desc: ${
            project.description.length > 100
              ? `${project.description.slice(0, 100)}...`
              : project.description
          }`,
          value: String(i),
        }));

        let embed = new EmbedBuilder()
          .setAuthor({
            name: member.displayName,
            iconURL: member.displayAvatarURL(),
          })
          .setTitle(`Number of projects -> ${sellerData.projects.length}`)
          .setColor(guild.members.me.displayHexColor);

        let projectsRow = new ActionRowBuilder({
          components: [
            new StringSelectMenuBuilder({
              customId: `projectsMenu`,
              placeholder: `Select the project`,
              options: projectsList.slice(0, 25),
            }),
          ],
        });

        let msg = await interaction.reply({
          embeds: [embed],
          components: [projectsRow],
          fetchReply: true,
          flags: [64],
        });
        let c = msg.createMessageComponentCollector({
          componentType: 3,
          filter: (i) => i.user.id === member.id,
        });
        c.on("collect", async (i) => {
          let projectData = sellerData.projects[i.values[0]];
          if (!projectData) {
            return i.update({
              content: `**${client.emoji.failed} Project not found.**`,
              components: [],
            });
          }

          sellerData.projects.splice(i.values[0], 1);
          await sellerData.save();

          await i.update({
            content: `**${client.emoji.done} The project has been successfully deleted**`,
            embeds: [],
            components: [],
          });
        });
      }

      if (values[0] === "addSocialMedia") {
        const titleRow = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("platformTitle")
            .setLabel("Platform Title")
            .setPlaceholder(`Ex: [Discord, Website, Github, Linkedin]...`)
            .setStyle(1)
        );

        const urlRow = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("platformUrl")
            .setLabel("Platform URL")
            .setPlaceholder("Ex: https://github.com/VampireKevin")
            .setStyle(1)
        );

        let socialMediaModal = new ModalBuilder()
          .setCustomId(`addSocialMediaModal`)
          .setTitle("Add New Social Media")
          .addComponents(titleRow, urlRow);

        await interaction.showModal(socialMediaModal);
      }

      if (values[0] === "removeSocialMedia") {
        let sellerData = await sellerschema.findOne({ sellerId: member.id });
        if (!sellerData)
          return interaction.reply({
            content: `${client.emoji.failed} No portfolio found for **@${member.user.username}**.`,
            components: [],
            flags: [64],
          });

        if (!sellerData.socialMedia === 0 || !sellerData.socialMedia.length)
          return interaction.reply({
            content: `**${client.emoji.failed} No social media found**`,
            components: [],
            flags: [64],
          });

        let socialMediaList = sellerData.socialMedia.map((s, i) => ({
          label: `#${i + 1} ${s.platform}`,
          description: s.url,
          value: String(i),
        }));

        let embed = new EmbedBuilder()
          .setAuthor({
            name: member.displayName,
            iconURL: member.displayAvatarURL(),
          })
          .setTitle(
            `Number of Social Media -> ${sellerData.socialMedia.length}`
          )
          .setColor(guild.members.me.displayHexColor);

        let projectsRow = new ActionRowBuilder({
          components: [
            new StringSelectMenuBuilder({
              customId: `socialMediaMenu`,
              placeholder: `Select the social media`,
              options: socialMediaList.slice(0, 25),
            }),
          ],
        });

        let msg = await interaction.reply({
          embeds: [embed],
          components: [projectsRow],
          fetchReply: true,
          flags: [64],
        });
        let c = msg.createMessageComponentCollector({
          componentType: 3,
          filter: (i) => i.user.id === member.id,
        });

        c.on("collect", async (i) => {
          let socialMediaData = sellerData.projects[i.values[0]];
          if (!socialMediaData) {
            return i.update({
              content: `**${client.emoji.failed} Social media not found.**`,
              components: [],
            });
          }

          sellerData.socialMedia.splice(i.values[0], 1);
          await sellerData.save();

          await i.update({
            content: `**${client.emoji.done} Social Media has been successfully deleted**`,
            embeds: [],
            components: [],
          });
        });
      }

    } else if (interaction.isModalSubmit()) {
      if (customId == "addProjectModal") {
        const type = fields.getTextInputValue("projectType");
        const title = fields.getTextInputValue("projectTitle");
        const description = fields.getTextInputValue("projectDescription");

        const links = fields
          .getTextInputValue("projectLinks")
          ?.split(",")
          .map((v) => v.trim())
          .filter((v) => v);

        const image = fields.getTextInputValue("projectImages");

        if (image) {
          if (!isValidImageURL(image))
            return interaction.reply({
              content: `**${client.emoji.failed} Image is invalid**`,
              flags: [64],
            });
        }

        let sellerData = await sellerschema.findOne({ sellerId: member.id });
        if (!sellerData)
          return interaction.reply({
            content: `${client.emoji.failed} No portfolio found for **@${member.user.username}**.`,
            flags: [64],
          });

        let options = [];

        if (type.toLowerCase() === "programming") {
          options = [
            { label: "HTML", value: "HTML" },
            { label: "CSS", value: "CSS" },
            { label: "JavaScript", value: "JavaScript" },
            { label: "TypeScript", value: "TypeScript" },
            { label: "React", value: "ReactJs" },
            { label: "Bootstrap", value: "Bootstrap" },
            { label: "Tailwind", value: "Tailwind" },
            { label: "Node.js", value: "NodeJs" },
            { label: "Next.js", value: "NextJs" },
            { label: "Python", value: "Python" },
            { label: "Dart / Flutter", value: "Flutter" },
          ].map((opt) => ({
            ...opt,
            emoji: getEmojiCustom(opt.value),
          }));
        } else if (type.toLowerCase() === "design") {
          options = [
            { label: "Photoshop", value: "Photoshop" },
            { label: "After Effects", value: "AfterEffects" },
            { label: "Illustrator", value: "Illustrator" },
            { label: "Figma", value: "Figma" },
            { label: "Canva", value: "Canva" },
          ].map((opt) => ({
            ...opt,
            emoji: getEmojiCustom(opt.value),
          }));
        } else {
          return interaction.reply({
            content: `${client.emoji.failed} Please specify a valid project type (Programming / Design).`,
            flags: [64],
          });
        }

        const langRow = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`selectLanguages`)
            .setPlaceholder(
              type.toLowerCase() === "design"
                ? "Select tools used in design"
                : "Select programming languages used"
            )
            .setMinValues(1)
            .setMaxValues(Math.min(options.length, 14))
            .addOptions(options)
        );

        let msg = await interaction.reply({
          components: [langRow],
          flags: [64],
          fetchReply: true,
        });

        let c = msg.createMessageComponentCollector({
          componentType: 3,
          filter: (i) => i.user.id === member.id,
        });

        c.on("collect", async (i) => {
          const langs = i.values;
          const embed = new EmbedBuilder()
            .setColor(guild.members.me.displayHexColor)
            .setTitle("Project Added Successfully")
            .addFields(
              { name: "Type", value: `\`\`\`${type}\`\`\`` },
              { name: "Title", value: `\`\`\`${title}\`\`\`` },
              { name: "Description", value: `\`\`\`${description}\`\`\`` },
              {
                name: "Links",
                value: `\`\`\`${
                  links?.length ? links.join("\n") : "None"
                } \`\`\``,
              },
              {
                name: "Languages",
                value: `\`\`\`${langs.join(", ")}\`\`\``,
              }
            )
            .setTimestamp();

          if (image) {
            embed.setImage(image);
          }

          await i
            .update({
              embeds: [embed],
              components: [],
            })
            .catch(() => {});

          sellerData.projects.push({
            type,
            title,
            description,
            links: {
              viewProject: links[0],
              openSource: links[1],
            },
            image,
            languages: langs,
          });
          await sellerData.save();
        });
      }

      if (customId === "addSocialMediaModal") {
        const title = fields.getTextInputValue("platformTitle");
        const url = fields.getTextInputValue("platformUrl");

        if (!isValidURL(url))
          return interaction.reply({
            content: `**${client.emoji.failed} Link is invalid**`,
            flags: [64],
          });

        let sellerData = await sellerschema.findOne({ sellerId: member.id });
        if (!sellerData)
          return interaction.reply({
            content: `${client.emoji.failed} No portfolio found for **@${member.user.username}**.`,
            flags: [64],
          });

        sellerData.socialMedia.push({
          platform: title.toLowerCase(),
          url,
        });
        await sellerData.save();

        const embed = new EmbedBuilder()
          .setColor(guild.members.me.displayHexColor)
          .setTitle("Social Media Added Successfully")
          .addFields(
            { name: "Platform", value: `\`\`\`${title}\`\`\`` },
            { name: "Url", value: `\`\`\`${url}\`\`\`` }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: [64] });
      }
    }
  },
};
