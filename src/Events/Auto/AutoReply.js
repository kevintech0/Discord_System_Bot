const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "messageCreate",

  /**
   * @param {import("discord.js").Message} message
   */
  run: async (client, message) => {
    if (!message.guild || message.author.bot) return;

    const { guild, content, member } = message;
    const lineImage = "https://i.ibb.co/k2NPsjjm/Nexode-Line.png";

    const autoReplies = [
      {
        trigger: "-",
        reply: `## ${client.emoji.nexode} مـرحباً بك فـي سـيرفـر خدمات نيكسود
### نـورتـنا وشرفـتنا بوجودك معنا <a:n_heart:1430361868714639461>

**<a:n_unique:1430363922233425920> قـبل مـا تـبدأ الـدردشـة فـي الشات العـام:**
> تأكد من قراءة: <#1424177844438831184>
> وتعرّف على السّيرفر أكـثـر مـن خـلال <#1429654770511122473>

**<a:n_news:1430362358202765333> تذكّر دائماً:**
"وَقُولُوا لِلنَّاسِ حُسْنًا"
(سورة البقرة – آية 83)

**الاحـتـرام هـو أسـاس تـواجـدنـا هـنـا،**
فـاحـتـرم تُـحـتـرم`,
        mention: true,
        delete: true,
        replyOnMessage: true,
        line: true,
        wildcard: false,
      },
      {
        trigger: "خط",
        reply: "",
        mention: false,
        delete: true,
        replyOnMessage: false,
        line: true,
        wildcard: false,
      },
      {
        trigger: "line",
        reply: "",
        mention: false,
        delete: true,
        replyOnMessage: false,
        line: true,
        wildcard: false,
      },
    ];

    for (const r of autoReplies) {
      const trigger =
        r.wildcard && content
          ? content.toLowerCase().includes(r.trigger.toLowerCase().trim())
          : content.toLowerCase().trim() === r.trigger.toLowerCase().trim();

      if (!trigger) continue;

      let reply = r.reply
        ?.replaceAll("[user]", member)
        .replaceAll("[userName]", member.user.username)
        .trim();

      if (reply?.length > 2000) reply = reply.slice(0, 2000);

      try {
        if (reply && reply.length > 0) {
          const replyOptions = {
            content: reply,
            allowedMentions: { repliedUser: !!r.mention },
          };

          if (r.replyOnMessage) {
            await message.reply(replyOptions);
          } else {
            await message.channel.send(replyOptions);
          }
        }

        if (r.delete) {
          await message.delete().catch(() => null);
        }

        if (r.line && lineImage) {
          await message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(guild.members.me.displayHexColor)
                .setImage(lineImage),
            ],
          });
        }
      } catch (err) {
        console.error("Auto-reply error:", err);
      }

      break;
    }
  },
};
