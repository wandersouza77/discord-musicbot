# começando a usar

- clone o repositorio com o comando "`git clone https://github.com/wandersouza77/discord-musicbot`" e entre na pasta

- renomeie **config.json.example** para **config.json**

- no arquivo **configs.json** adicione suas credenciais do youtube, token do discord, e escolha um prefix para seu bot

- crie uma **image docker** e escolhe um nome para ela usando o comando "`docker image build -t nomedoseubot .`"

- inicie um **novo container** com a imagem pronta do bot com o comando "`docker container run -d nomedoseubot`"