const axios = require('axios').default;
const Discord = require('discord.js');
const { response } = require('express');

const apiEndpoints = {
  base: "https://api.tos.world",
  creatures: "/gamedata/creatures/public",
  gatherables: "/gamedata/gatherables/public",
  crafting: "/gamedata/crafting/public",
  maps: "/gamedata/maps/public"
}

module.exports = class Commands {

  mapsStr = "";

  constructor() {}

  async info(msg, args) {
    axios.get(`${apiEndpoints.base}${apiEndpoints.creatures}`)
      .then(response => {
        const creatures = response.data
        let creatureName = "";
        args.forEach(arg => {
          if (creatureName === "") {
            creatureName += arg;
          } else {
            creatureName += ` ${arg}`
          }
        })
        const filtered = creatures.filter(creature => creature.Label.toLowerCase() === creatureName)
        filtered.forEach(creature => {
            const exampleEmbed = new Discord.MessageEmbed()
          	.setColor('#0099ff')
          	.setTitle(creature.Name)
          	.setAuthor('Wiki Bot')
            .setThumbnail('https://cdn.discordapp.com/attachments/909562587950231672/947985850640248832/icon_tos.png')
          	.addFields(
          		{ name: 'Min. Skinning', value: creature.SkinningMinSkill ? creature.SkinningMinSkill : 'N/A', inline: true },
          		{ name: 'Min. Taming', value: creature.MinTameSkill ? creature.MinTameSkill : 'N/A', inline: true },
          		{ name: '\u200B', value: '\u200B' },
          	)

            let skinningStr = "";
            creature.Skinning.forEach(material => {
              skinningStr += `\n${material.ItemName}`
            })
            skinningStr !== "" ? exampleEmbed.addField('Skinning', skinningStr, true) : null;

            let lootStr = "";
            creature.Loot.forEach(material => {
              lootStr += `\n${material.ItemName} - ${material.Chance}%`
            })
            lootStr !== "" ? exampleEmbed.addField('Drops', lootStr, true) : null;
            
            msg.channel.send(exampleEmbed);
          })
      })

    axios.get(`${apiEndpoints.base}${apiEndpoints.gatherables}`)
      .then(response => {
        const gatherables = response.data;
        let gatherableName = "";
        args.forEach(arg => {
          if (gatherableName === "") {
            gatherableName += arg;
          } else {
            gatherableName += ` ${arg}`
          }
        })

        const filtered = gatherables.filter(gatherable => gatherable.SpotPrefab.toLowerCase() === gatherableName)
        filtered.forEach(async gatherable => {
            const exampleEmbed = new Discord.MessageEmbed()
          	.setColor('#0099ff')
          	.setTitle(gatherable.SpotPrefab)
          	.setAuthor('Wiki Bot')
            .setThumbnail(gatherable.Rewards[0].Item.Icon)
          	.addFields(
          		{ name: 'Min. Skill', value: gatherable.MinSkill ? gatherable.MinSkill : 'N/A', inline: true },
          		{ name: 'Max. Skill', value: gatherable.MaxSkillGain ? gatherable.MaxSkillGain : 'N/A', inline: true },
          		{ name: '\u200B', value: '\u200B' },
          	)

            const mapsStr = await this.getMaps(gatherableName);

            exampleEmbed.addField('Mapas', this.mapsStr, true);

            let gatherableStr = "";
            gatherable.Rewards.forEach(material => {
              gatherableStr += `\n${material.ItemName}`
            })
            gatherableStr !== "" ? exampleEmbed.addField(gatherable.GatherAction, gatherableStr, true) : null;
            
            msg.channel.send(exampleEmbed);
          })

      })

    axios.get(`${apiEndpoints.base}${apiEndpoints.crafting}`)
      .then(response => {
        const gatherables = response.data;
      })

  }

  async map(msg) {
    const embed = new Discord.MessageEmbed().setTitle('Attachment').setImage('https://i.imgur.com/kPNUjhw.jpeg');
    msg.lineReply({ embeds: [embed], files: ['https://i.imgur.com/kPNUjhw.jpeg'] });
  }

  async help(msg) {
    const cmd = new Commands();
    let helpCommand = "```CSS\n"
    helpCommand += ".find <material> - lista os mapas com o material selecionado\n"
    helpCommand += ".map - exibe o mapa\n"
    helpCommand += ".drop <item> - exibe quais mobs dropam o item selecionado\n"
    helpCommand += ".skinning <item> - exibe quais mobs dão o item selecionado com skinning\n"
    helpCommand += ".info <mob> - exibe informações básicas do mob\n"
    helpCommand += "```"
    msg.lineReply(helpCommand);
  }

  async drop(msg, args) {
    axios.get(`${apiEndpoints.base}${apiEndpoints.creatures}`)
      .then(response => {
        const creatures = response.data;
        let lootStr = "";
        creatures.forEach(creature => {
            creature.Loot.forEach(material => {
              if (args.every(item => material.ItemName.toLowerCase().includes(item.toLowerCase()))){
                lootStr += `\n${creature.Label}`
              }
            })
        })
        msg.lineReply(lootStr)
      })
  }

  async skinning(msg, args) {
    axios.get(`${apiEndpoints.base}${apiEndpoints.creatures}`)
      .then(response => {
        const creatures = response.data;
        let skinningStr = "";
        creatures.forEach(creature => {
            creature.Skinning.forEach(material => {
              if (args.every(item => material.ItemName.toLowerCase().includes(item.toLowerCase()))){
                skinningStr += `\n${creature.Label}`
              }
            })
        })
        msg.lineReply(skinningStr)
      })
  }

  async getMaps(matName) {
    await axios.get(`${apiEndpoints.base}${apiEndpoints.maps}`)
      .then(response => {
        const maps = response.data[1].scenes;
        const matchedMaps = [];

        maps.forEach(map => {
          map.Rocks.forEach(rock => {
            if(rock.SpotName.toLowerCase() === matName) {
              matchedMaps.push({mapCoord: map.ClientScene, mapName: map.SceneName, mapDifficulty: map.Difficulty, chance: rock.Chance})
            }
          })
          map.Plants.forEach(plant => {
            if(plant.SpotName.toLowerCase() === matName) {
              matchedMaps.push({mapCoord: map.ClientScene, mapName: map.SceneName, mapDifficulty: map.Difficulty, chance: plant.Chance})
            }
          })
          map.Trees.forEach(tree => {
            if(tree.SpotName.toLowerCase() === matName) {
              matchedMaps.push({mapCoord: map.ClientScene, mapName: map.SceneName, mapDifficulty: map.Difficulty, chance: tree.Chance})
            }
          })
        })

        let mapsStr = "";
        matchedMaps.forEach(map => {
          let emote = "";
          switch (map.mapDifficulty) {
            case 'Safe':
              emote = ":blue_square:"
              break;
            case 'Yellow':
              emote = ":yellow_square:"
              break;
            case 'Red':
              emote = ":red_square:"
              break;
            case 'Black':
              emote = ":white_square_button:"
              break;
          }
          mapsStr += `${emote} ${map.mapCoord} - ${map.mapName} - ${map.chance}%\n`
        })

        if (matchedMaps.length > 0) {
          this.mapsStr = mapsStr;
        } else {
          this.mapsStr = "Não foi encontrado nenhum mapa com esse material, verifique se foi digitado corretamente. Atualmente apenas os nomes em inglês são suportados.";
        }
    })
  }

  async find(msg, args) {
    axios.get(`${apiEndpoints.base}${apiEndpoints.maps}`)
      .then(response => {
        const maps = response.data[1].scenes;
        const matchedMaps = [];

        maps.forEach(map => {
          map.Rocks.forEach(rock => {
            if(args.every(item => rock.SpotName.toLowerCase().includes(item.toLowerCase()))) {
              matchedMaps.push({mapCoord: map.ClientScene, mapName: map.SceneName, mapDifficulty: map.Difficulty, chance: rock.Chance})
            }
          })
          map.Plants.forEach(plant => {
            if(args.every(item => plant.SpotName.toLowerCase().includes(item.toLowerCase()))) {
              matchedMaps.push({mapCoord: map.ClientScene, mapName: map.SceneName, mapDifficulty: map.Difficulty, chance: plant.Chance})
            }
          })
          map.Trees.forEach(tree => {
            if(args.every(item => tree.SpotName.toLowerCase().includes(item.toLowerCase()))) {
              matchedMaps.push({mapCoord: map.ClientScene, mapName: map.SceneName, mapDifficulty: map.Difficulty, chance: tree.Chance})
            }
          })
        })

        let mapsStr = "Procure nos mapas:\n";
        matchedMaps.forEach(map => {
          let emote = "";
          switch (map.mapDifficulty) {
            case 'Safe':
              emote = ":blue_square:"
              break;
            case 'Yellow':
              emote = ":yellow_square:"
              break;
            case 'Red':
              emote = ":red_square:"
              break;
            case 'Black':
              emote = ":white_square_button:"
              break;
          }
          mapsStr += `${emote} ${map.mapCoord} - ${map.mapName} - ${map.chance}%\n`
        })

        if (matchedMaps.length > 0) {
          msg.lineReply(mapsStr);
        } else {
          msg.lineReply("Não foi encontrado nenhum mapa com esse material, verifique se foi digitado corretamente. Atualmente apenas os nomes em inglês são suportados.")
        }
    })
  }
}