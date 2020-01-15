const Discord = require('discord.js')
const client = new Discord.Client()
const ytdl = require('ytdl-core')
const { prefix, token, apiKey } = require('../config.json')
const Youtube = require('simple-youtube-api')
const youtube = new Youtube(apiKey)
const controles = {}

client.on('ready', () => {
    console.log('bot iniciado!')
    client.user.setActivity(`${prefix}play + [música] para tocar 🎵`, {type: 'LISTENING'})
})

/* ignora mensagem de bots */
client.on('message',async msg => {
    if (msg.author.bot) return
    /* ignora se o prefix não estiver no inicio da mensagem */
    if (msg.content.indexOf(prefix) !== 0) return
    /* mensagem sem o prefix em um array por cada espaço em branco */
    const args = msg.content.slice(prefix.length).trim().split(/ +/g)
    /* removendo o comando dos argumentos e adicionando a variavel */
    const comando = args.shift().toLowerCase()
    /* canal de voz que o usuário está */
    const voiceChannel = await msg.member.voiceChannel
    
    // comando play //
    switch (comando){
        case 'play':
        case 'start':
        case 'tocar':
            /* se nao estiver em um canal de voz */
            if(!voiceChannel) return msg.reply('você não está em um canal de voz!')
            const pesquisa = args.join(' ')
            /* junta os argumentos */
            /* se nao vir nada nos argumentos retornar msg */
            if(!pesquisa) return msg.reply(`Adicione o nome da música ou cantor ex: **${prefix}play post malone**`)
            const videos = await youtube.searchVideos(pesquisa, 5)
            /* pesquisa 5 videos usando o que foi digitado pelo usuário */
            /* percorre os videos extraindo os nomes e os links adicionando a variavel titulos */
            const titulos = videos.map((result, i) => {
                return `**${i + 1}.** [${result.title}](${result.url})`
            })
            /* percorre os videos pegando somente o link */
            const url = videos.map(video => video.url)
            /* percorre os videos pegando somente a thumb */
            const thumb = videos.map(video => video.thumbnails.default.url)
            /* salva o username de quem enviou o comando */
            const perguntaAutor = msg.author.username
            /* mensagem pronta contendo as 5 opções de músicas */
            const embedResposta = new Discord.RichEmbed()
                .setTitle('RESULTADOS!')
                .setColor(0x0000FF)
                .setAuthor(`Olá ${perguntaAutor}`)
                .setDescription(titulos)
                .setThumbnail('https://i.imgur.com/g9myRV4.png')
                .setFooter('Digite a opção em até 15s')
                /* envia a resposta no chat contento as opções */
            msg.channel.send({ embed: embedResposta })
            /* espera uma nova mensagem no chat, se nenhuma mensagem vir, deleta as ultimas 2 do chat*/
            const resposta = await msg.channel.awaitMessages(msg => msg.content,{ max: 1, time: 15000, errors: ['time'] })
                .catch(() => msg.channel.bulkDelete(2))
                /* username de quem respondeu o bot no chat */
            const respAutor = resposta.map(resp => resp.author.username).toString()
            /* se o nick de quem PEDIU a música for diferente de quem ESCOLHEU ignora */
            if(perguntaAutor !== respAutor) return
            /* transforma a resposta da música em INT */
            const opcao = parseInt(resposta.map(resp => resp.content))
            /* se a resposta for falsa, maior que 5 ou não for um número retornar msg */
            if(!opcao || opcao > 5 || !isNaN ) return msg.channel.send('opcão inválida!')
            /* conexão com canal de voz */
            const connection = await msg.member.voiceChannel.join()
            /* se já estiver algo tocando, nao permitir colocar outra por cima */
            if(controles.tocando) return msg.reply('já tem uma música tocando!')
            /* abre stream de audio usando ytdl */
            const dispatcher = connection.playStream(ytdl(url[opcao - 1], {filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1<<25 }), {highWaterMark: 1})
            /* embed pronto contendo o que está tocando no momento, e quem pediu a música */
            const embedMusic = new Discord.RichEmbed()
                .setDescription(`🎵 ${titulos[opcao - 1]}`)
                .setThumbnail(thumb[opcao - 1])
                .setAuthor(`Pedida por ${msg.author.username}`)
                .setFooter(`${prefix}pause para ⏸️, ${prefix}resume para ⏯, ${prefix}stop para ⏹️`)
                .setColor(0x0000FF)
                /* quando começar a tocar envia o embed pronto contendo o que está tocando, seta variavel tocando para true */
            dispatcher.on('start', () => msg.channel.send({embed: embedMusic}).then(() => controles.tocando = true))
            /* id de quem ESCOLHEU a música */
            controles.autor = msg.author.id
            /* quando a música acabar o bot sai do canal d voz */
            dispatcher.on('end', () => voiceChannel.leave())
            /* seta a variavel que controla se algo está tocando para false */
            dispatcher.on('end', () => controles.tocando = false)
        break
        // fim comando play //
        
        // comando pause //
        case 'pause':
        case 'pausar':
            await playStop('pause', 'pausando...', msg)
        break
        // fim comando pause //
        
        // comando resume //
        case 'resume':
        case 'despausar':
        case 'resumir':
            await playStop('resume', 'voltando a tocar...', msg)
        break
        // fim comando resume //
        
        // comando stop //
        case 'stop':
        case 'parar':
            await playStop('stop', 'saindo...', msg)
        break
        // fim comando stop //
    }
    
    async function playStop(command, message, msg){
        /* se não estiver em um canal d voz retorna msg */
        if(!voiceChannel) return msg.reply('você não está em um canal de voz!')
            /* se não estiver tocando nada */
            if(!controles.tocando) return msg.reply('não tem nada tocando para parar!')
            /* bot pega a mensagem */
            controles.lastMSG = await msg.channel.fetchMessages({limit: 1})
            /* bot pega o id do autor da ultma mensagem */
            controles.lastAutor = controles.lastMSG.map(msg => msg.author.id).toString()
            /* se o id d quem pediu a música for diferente d quem está tentando pausar, retornar msg */
            if(controles.autor !== controles.lastAutor) return

            /* açoes com base no comando desejado */
            if(command === 'stop'){
                await msg.channel.send(`${message}...`)
                .then(() => voiceChannel.leave())
            }
            if(command === 'pause') {
                await msg.channel.send(`${message}...`)
                .then(() => voiceChannel.connection.player.dispatcher.pause())
            }
            if(command === 'resume'){
                await msg.channel.send(`${message}...`)
                .then(() => voiceChannel.connection.player.dispatcher.resume())
            }
    }
})

client.login(token)