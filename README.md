1 - baixar o Postrgresql, e criar o banco com nome "projeto" e as tabelas correspondentes ao projeto, cujo os códigos utilizados são: 

CREATE TABLE users(
filial INTEGER PRIMARY KEY NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(100) NOT NULL);

CREATE TABLE products (
lote INTEGER PRIMARY KEY NOT NULL,
product_filial INTEGER REFERENCES users(filial) ON DELETE CASCADE,
name VARCHAR (100) NOT NULL,
date DATE NOT NULL,
category VARCHAR(15) NOT NULL
);

CREATE TABLE sessions (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

*COMO O PROJETO ESTÁ EM ANDAMENTO, AS TABELAS PODEM MUDAR A QUALQUER MOMENTO, E CASO ACONTEÇA, ALTERAREI AQUI OS CÓDIGOS*
*NA INSTALAÇÃO DO POSTGRESQL ELE PEDE PARA QUE COLOQUE UMA SENHA NO BANCO, DEIXE A SENHA 123*

2 - Baixar o Node.JS, tem tutorial no youtube, porém é simples.

3 - Baixar o VSCode. Nenhuma extenção é obrigatória, mas tem várias úteis. Use as que preferir.

4 - Ao baixar o VSCode e a pasta do projeto, é só acessar essa pasta através do VSCode, como qualquer outro projeto.

5 - Ao acessar o projeto, abra um terminal. Vocês pode fazer isso acessando o menu ao topo da tela, na aba "Terminal" e clickando em "New Terminal", ou posicionando o cursor na parte de baixo da tela e puxando para cima.

6 - Se certifique que o terminal aberto é um CMD e não um PowerShell. Pra saber é só olhar para direita do terminal, se estiver escrito CMD é o correto, se não, clique na seta para baixo e selecione o CMD. 

7 - Digite "cd" no terminal, e no menu lateral do VSCode, você verá a pasta do projeto. Literalmente clique e arraste aquela pasta para o terminal, o código ficará algo parecido com: "cd c:\Users\henri\Desktop\projeto\projeto". Feito isso, execute. Você estará dentro da página do projeto pelo terminal. 

8 - Digite e execute "npm install" no terminal, para instalar as dependências e/ou certificar que estejam instaladas.

9- Para finalmente rodar o projeto, digite e execute no terminal "nodemon index.js" e digite no navegador web "localhost:3000", que o projeto abrirá.

