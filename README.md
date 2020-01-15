# começando a usar
0- clone o repositorio com o comando "git clone https://github.com/wandersouza77/discord-musicbot" e entre na pasta
1- renomeie config.json.example para config.json  
2- no arquivo configs.json adicione suas credenciais do youtube, token do discord, e escolha um prefix para seu bot
3- crie uma image docker e escolhe um nome para ela usando o comando "docker image build -t nomedoseubot . "
4- inicie um novo container com a imagem pronta do bot com o comando "docker container run -d nomedoseubot"