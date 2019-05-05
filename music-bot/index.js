const Discord = require('discord.js')
const client = new Discord.Client()
const ytdl = require('ytdl-core')
const { prefix, token, apiKey } = require('./config.json.js')
const Youtube = require('simple-youtube-api')
const youtube = new Youtube(apiKey)
const controles = {}

client.on('ready', () => {
    console.log('bot iniciado!')
    client.user.setActivity(`${prefix}play + [música] para tocar 🎵`, {type: 'LISTENING'})
})

client.on('message',async msg => {
    if (msg.author.bot) return
    /* ignora mensagem de bots */
    if (msg.content.indexOf(prefix) !== 0) return
    /* ignora se o prefix não estiver no inicio da mensagem */
    const args = msg.content.slice(prefix.length).trim().split(/ +/g)
    /* mensagem sem o prefix em um array por cada espaço em branco */
    const comando = args.shift().toLowerCase()
    /* removendo o comando dos argumentos e adicionando a variavel */
    const voiceChannel = await msg.member.voiceChannel
    /* canal de voz que o usuário está */
    
    // comando play //
    switch (comando){
        case 'play':
        case 'start':
        case 'tocar':
            if(!voiceChannel) return msg.reply('você não está em um canal de voz!')
            /* se nao estiver em um canal de voz */
            const pesquisa = args.join(' ')
            /* junta os argumentos */
            if(!pesquisa) return msg.reply(`Adicione o nome da música ou cantor ex: **${prefix}play post malone**`)
            /* se nao vir nada nos argumentos retornar msg */
            const videos = await youtube.searchVideos(pesquisa, 5)
            /* pesquisa 5 videos usando o que foi digitado pelo usuário */
            const titulos = videos.map((result, i) => {
                return `**${i + 1}.** [${result.title}](${result.url})`
            })
            /* percorre os videos extraindo os nomes e os links adicionando a variavel titulos */
            const url = videos.map(video => video.url)
            /* percorre os videos pegando somente o link */
            const thumb = videos.map(video => video.thumbnails.default.url)
            /* percorre os videos pegando somente a thumb */
            const perguntaAutor = msg.author.username
            /* salva o username de quem enviou o comando */
            const embedResposta = new Discord.RichEmbed()
                .setTitle('RESULTADOS!')
                .setColor(0x0000FF)
                .setAuthor(`Olá ${perguntaAutor}`)
                .setDescription(titulos)
                .setThumbnail('https://i.imgur.com/g9myRV4.png')
                .setFooter('Digite a opção em até 15s')
            /* mensagem pronta contendo as 5 opções de músicas */
            msg.channel.send({ embed: embedResposta })
            /* envia a resposta no chat contento as opções */
            const resposta = await msg.channel.awaitMessages(msg => msg.content,{ max: 1, time: 15000, errors: ['time'] })
                .catch(() => msg.channel.bulkDelete(2))
            /* espera uma nova mensagem no chat, se nenhuma mensagem vir, deleta as ultimas 2 do chat*/
            const respAutor = resposta.map(resp => resp.author.username).toString()
            /* username de quem respondeu o bot no chat */
            if(perguntaAutor !== respAutor) return msg.channel.bulkDelete(2)
                .then(() => msg.reply('PARA DE ATRAPALHAR O COLEGUINHA 🤬'))
            /* se o nick de quem PEDIU a música for diferente de quem ESCOLHEU a música deleta 2 mensagens, e retorna msg */
            const opcao = parseInt(resposta.map(resp => resp.content))
            /* transforma a resposta da música em INT */
            if(!opcao || opcao > 5 || !isNaN ) return msg.channel.send('opcão inválida!')
            /* se a resposta for falsa, maior que 5 ou não for um número retornar msg */
            const connection = await msg.member.voiceChannel.join()
            /* conexão com canal de voz */
            if(controles.tocando) return msg.reply('já tem uma música tocando!')
            /* se já estiver algo tocando, nao permitir colocar outra por cima */
            const dispatcher = connection.playStream(ytdl(url[opcao - 1], {filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1<<25 }), {highWaterMark: 1})
            /* abre stream de audio usando ytdl */
            const embedMusic = new Discord.RichEmbed()
                .setDescription(`🎵 ${titulos[opcao - 1]}`)
                .setThumbnail(thumb[opcao - 1])
                .setAuthor(`Pedida por ${msg.author.username}`)
                .setFooter(`${prefix}pause para ⏸️, ${prefix}resume para ⏯, ${prefix}stop para ⏹️`)
                .setColor(0x0000FF)
            /* embed pronto contendo o que está tocando no momento, e quem pediu a música */
            dispatcher.on('start', () => msg.channel.send({embed: embedMusic}).then(() => controles.tocando = true))
            /* quando começar a tocar envia o embed pronto contendo o que está tocando, seta variavel tocando para true */
            controles.autor = msg.author.id
            /* id de quem ESCOLHEU a música */
            dispatcher.on('end', () => voiceChannel.leave())
            /* quando a música acabar o bot sai do canal d voz */
            dispatcher.on('end', () => controles.tocando = false)
            /* seta a variavel que controla se algo está tocando para false */
        break
        // fim comando play //
        
        // comando pause //
        case 'pause':
        case 'pausar':
            if(!voiceChannel) return msg.reply('você não está em um canal de voz!')
            /* se não estiver em um canal d voz retorna msg */
            if(!controles.tocando) return msg.reply('não tem nada tocando para resumir!')
            /* se não estiver tocando nada */
            controles.lastMSG = await msg.channel.fetchMessages({limit: 1})
            /* bot pega a mensagem */
            controles.lastAutor = controles.lastMSG.map(msg => msg.author.id).toString()
            /* bot pega o id do autor da ultma mensagem */
            if(controles.autor !== controles.lastAutor) return msg.reply('não foi você que pediu a música trouxa!')
            /* se o id d quem pediu a música for diferente d quem está tentando pausar, retornar msg */
            await msg.channel.send('pausando...')
                    .then(() => voiceChannel.connection.player.dispatcher.pause())
            /* pausa a música */
        break
        // fim comando pause //
        
        // comando resume //
        case 'resume':
        case 'despausar':
            if(!voiceChannel) return msg.reply('você não está em um canal de voz!')
            if(!controles.tocando) return msg.reply('não tem nada tocando para pausar!')
            controles.lastMSG = await msg.channel.fetchMessages({limit: 1})
            controles.lastAutor = controles.lastMSG.map(msg => msg.author.id).toString()
            if(controles.autor !== controles.lastAutor) return msg.reply('não foi você que pediu a música trouxa!')
            await msg.channel.send('voltando a tocar...')
                .then(() => voiceChannel.connection.player.dispatcher.resume())
        break
        // fim comando resume //
        
        // comando stop //
        case 'stop':
        case 'parar':
            if(!voiceChannel) return msg.reply('você não está em um canal de voz!')
            if(!controles.tocando) return msg.reply('não tem nada tocando para parar!')
            controles.lastMSG = await msg.channel.fetchMessages({limit: 1})
            controles.lastAutor = controles.lastMSG.map(msg => msg.author.id).toString()
            if(controles.autor !== controles.lastAutor) return msg.reply('não foi você que pediu a música trouxa!')
            await msg.channel.send('saindo...')
                .then(() => voiceChannel.leave())
        break
        // fim comando stop //
    }    
})

client.login(token)