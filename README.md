# Dieta da Joice

App de dieta feito em HTML, CSS e JavaScript puros. Não tem framework e não precisa de build complicado.
Funciona no celular (dá para instalar no iPhone) e no computador.

No ar: https://dieta-da-joice-app.netlify.app

## Como o projeto está organizado

```
public/                 ← o site em si (é isto que vai para a internet)
  index.html            versão celular (abre sozinha em telas pequenas)
  web.html              versão computador (abre sozinha em telas grandes)
  manifest.webmanifest  nome e ícone do app instalado no iPhone
  sw.js                 deixa o app abrir sem internet e mostra os lembretes
  icons/                ícones do app
netlify/functions/
  dieta.mjs             guarda o "código da dieta" na internet (Netlify Blobs)
  push.mjs              guarda a inscrição de lembretes de cada aparelho
  lembretes.mjs         roda a cada 5 minutos e manda os avisos de água e refeição
src/                    ← onde você edita
  app.js                telas, alimentos, cardápios e contas
  base.css              visual comum
  mobile.css            visual do celular
  desktop.css           visual do computador
  build.py              junta tudo e gera public/index.html e public/web.html
netlify.toml            configuração do Netlify
package.json            dependências das funções (@netlify/blobs e web-push)
```

## Como alterar

1. Edite os arquivos em `src/`. Por exemplo, os alimentos e os cardápios prontos ficam no começo de `src/app.js`.
2. Rode `python3 src/build.py`. Ele gera de novo `public/index.html` e `public/web.html`.
3. Faça commit e push no GitHub.

Se o Netlify estiver ligado ao repositório (veja abaixo), o site é publicado sozinho a cada push.

## Publicar no Netlify pelo GitHub (publicação automática)

1. No Netlify: **Add new project › Import an existing project › GitHub** e escolha este repositório.
2. O Netlify lê o `netlify.toml` sozinho. Não precisa mudar nada: a pasta publicada é `public` e as funções ficam em `netlify/functions`.
3. Clique em **Deploy**. Daí em diante, cada push na branch `main` publica uma nova versão.
4. Em **Project configuration › Access & security › Visitor access**, deixe o acesso aberto. Se não fizer isso, só quem está logado no Netlify consegue abrir o site.

## Lembretes com o app fechado (notificação push)

Os avisos de água e de refeição são mandados pelo servidor, então chegam mesmo com o app fechado.
Para funcionar, o Netlify precisa de três variáveis (uma vez só):

1. No Netlify: **Project configuration › Environment variables › Add a variable**.
2. Crie estas três, com escopo "Functions" (ou todos):
   - `VAPID_PUBLIC_KEY`: a chave pública
   - `VAPID_PRIVATE_KEY`: a chave privada (nunca coloque no código nem no GitHub)
   - `VAPID_SUBJECT`: `https://dieta-da-joice-app.netlify.app`
3. Faça um novo deploy (ou **Deploys › Trigger deploy**).
4. No celular, abra o app e ligue os lembretes de novo em **Água › Lembretes**.

No iPhone, só funciona com o app instalado na tela de início e iOS 16.4 ou mais novo.
Sem as variáveis, o app continua funcionando e avisa só com ele aberto na tela.

Para gerar um par novo de chaves: `npx web-push generate-vapid-keys`.

## Levar para outra plataforma

- **Telas do app:** a pasta `public/` funciona em qualquer hospedagem de site estático, como GitHub Pages, Cloudflare Pages, Vercel ou uma hospedagem comum. Basta enviar o conteúdo dela.
- **O que depende do Netlify:** só o **código da dieta**, que salva e recupera a dieta em outro aparelho. Ele usa `netlify/functions/dieta.mjs` e o **Netlify Blobs** para guardar os dados. Em outra plataforma, essa parte precisa ser refeita com o serviço equivalente de lá (por exemplo, Cloudflare Workers + KV, ou Vercel Functions + um banco simples). O app chama sempre o endereço `/api/dieta?codigo=XXXX-XXXX-XXXX`, com `GET` para ler e `PUT` para salvar.
- **Sem essa função** o app continua funcionando normalmente. Tudo fica salvo no próprio aparelho, e só o botão "Meu código" mostra "sem internet".
- **Os dados guardados com o código ficam no Netlify.** Antes de trocar de plataforma, abra o app e use **Mais › Meu código › Salvar arquivo** para ter uma cópia.

## Observações

- Os valores nutricionais vêm da Tabela TACO (Unicamp). Os itens marcados como "estimado" (pão de passas e iogurte) devem ser conferidos no rótulo.
- Este app ajuda no dia a dia, mas não substitui médico ou nutricionista.
