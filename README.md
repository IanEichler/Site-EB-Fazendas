# EB Fazendas

Site completo da EB Fazendas, com identidade em marrom e bege, logo original, catálogo de 34 propriedades e 705 fotografias locais.

Interface em HTML, CSS e JavaScript, sem dependências de produção. Inclui busca, filtros, ordenação, paginação, favoritos no navegador, galerias, vídeos e contato direto por WhatsApp. No celular, há navegação fixa, filtros em painel, áreas de toque maiores e gestos horizontais na galeria. As animações respeitam a preferência de movimento reduzido.

## Publicar na Vercel

1. Importe o repositório `IanEichler/Site-EB-Fazendas` na Vercel.
2. Mantenha a raiz do projeto como `./`.
3. Use o preset **Other**, caso o painel peça um framework.
4. Publique com o comando `npm run build` e a pasta de saída `dist`.

Essas configurações já estão no `vercel.json`. O build gera 38 páginas com conteúdo e metadados próprios em `dist`; o servidor local e os arquivos de desenvolvimento ficam fora da pasta publicada.

Os links públicos de canonical, Open Graph e sitemap usam `SITE_URL`, quando definida. Sem ela, o build utiliza `VERCEL_PROJECT_PRODUCTION_URL` (domínio de produção informado pela Vercel), depois `VERCEL_URL`. Para um domínio próprio, você pode definir `SITE_URL=https://www.seudominio.com.br` nas variáveis do projeto e publicar novamente. Se as variáveis de sistema estiverem desabilitadas, habilite-as ou defina `SITE_URL`; a build na Vercel não publica endereços de localhost por engano. Builds locais usam `http://localhost:3000` e ficam marcadas para não indexação, assim como previews da Vercel.

As regras de reescrita mantêm as páginas internas acessíveis por links diretos e ao atualizar o navegador:

- `/`
- `/propriedades` — parâmetros de busca, filtros, ordenação e favoritos
- `/imovel/2` — detalhes; o mesmo padrão atende cada ID do catálogo
- `/quero-vender`
- `/contato` e `/contato?imovel=2`

O arquivo `404.html` gerado pelo build contém a página não encontrada e a diretiva `noindex`. As reescritas apontam para o HTML de cada rota; um ID inexistente não redireciona à página inicial. O build também gera `sitemap.xml`, `robots.txt`, dados estruturados, canonical e prévias Open Graph/Twitter. Cada imóvel utiliza sua própria foto real na prévia.

## Executar localmente

Com Node.js 18 ou superior:

```sh
npm start
```

Abra `http://localhost:3000`. No Windows, também é possível executar `iniciar.bat`.

```sh
npm run check
npm test
npm run build
npm run verify
```

Os comandos verificam a sintaxe, os links de contato, filtros, conteúdo e metadados das páginas, escape do catálogo e tratamento de URLs inexistentes. A build valida os arquivos locais do catálogo e gera `dist`. A verificação final percorre as 38 páginas geradas, o sitemap e as referências de arquivos locais.

## Estrutura

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura compartilhada, logo, ícones e diálogos |
| `site.js` | Navegação, filtros, favoritos, compartilhamento e galerias |
| `model.js`, `pages.js` | Dados formatados e templates compartilhados entre navegador e build |
| `seo.js`, `document.mjs` | Metadados e HTML completo de cada página |
| `styles.css`, `site.css`, `brown.css` | Base visual e identidade |
| `hero.css` | Capa institucional, composição de abertura e imagens responsivas |
| `refinements.css` | Busca compacta, cards e apresentação institucional |
| `typography.css` | Escala de fontes e estilos do WhatsApp |
| `mobile.css`, `mobile.js` | Experiência móvel, filtros e gestos |
| `motion.css`, `motion.js` | Animações e preferência de movimento reduzido |
| `data/properties.json` | Catálogo de propriedades |
| `assets/` | Fotografias, logo, fontes e licença do ícone de WhatsApp |
| `build.mjs`, `vercel.json` | Build estático e configuração da Vercel |
| `server.mjs` | Servidor para desenvolvimento local |

`app.js` é um arquivo preservado da primeira versão e não participa do site atual nem do build.

## Conteúdo e integrações

Os dados, as fotografias e os contatos foram obtidos do site público da EB Fazendas em 15/10/2026. O catálogo é uma cópia local e não se sincroniza automaticamente com o site original. Para atualizar anúncios, edite `data/properties.json` e os arquivos correspondentes em `assets/`.

O contato ocorre por links de WhatsApp, telefone e e-mail, sem formulários de atendimento ou backend próprio. Favoritos ficam no navegador do visitante. Vídeos, WhatsApp, Google Maps e Instagram utilizam serviços externos. Valores anunciados em sacas de soja preservam a unidade original e não entram em filtros em reais.

Compartilhamento utiliza a função nativa do dispositivo, quando disponível, e cópia do link como alternativa. As mensagens de interesse e o botão de compartilhar usam o domínio em que o visitante está navegando. O link “Ver anúncio original” continua disponível separadamente.

A apresentação institucional usa serviços e contatos confirmados no site público da EB Fazendas. A foto dessa seção é de uma propriedade do portfólio em Jaciara, identificada na legenda. Não representa a equipe nem o escritório; fotos e nomes de profissionais só devem ser adicionados quando fornecidos pela empresa.

A fotografia, o nome e a logo da EB Fazendas permanecem identificados como conteúdo da marca. O ícone de WhatsApp utiliza Bootstrap Icons; sua licença está em `assets/icons/bootstrap-icons-LICENSE.txt`.

As fontes Manrope e DM Serif Display são distribuídas com suas licenças em `assets/licenses/`.

## Fotografias e capa

A abertura utiliza uma paisagem ilustrativa criada com imagegen, sem vínculo com um imóvel anunciado. O prompt e a origem estão em `assets/hero/README.txt`. As capas e as galerias dos anúncios continuam usando fotografias reais dos respectivos imóveis, com as marcas originais preservadas.

Os cards utilizam variantes WebP em 480 e 800 pixels por meio de `picture` e `srcset`; o JPEG original permanece como fallback. Os arquivos originais de galeria permanecem disponíveis em resolução integral. Ao adicionar um imóvel, `cardImage` é opcional; sem variantes, o card usa `cover`.

Cada foto possui uma miniatura WebP de até 320 pixels em `assets/gallery/`, referenciada pelo campo opcional `fotos[].thumb`. A galeria carrega a foto original apenas na visualização grande; sua faixa de miniaturas usa esses arquivos menores, com carregamento sob demanda. Há 705 miniaturas, com cerca de 8 MB no conjunto, comparadas a cerca de 236 MB nas fotos originais (essa comparação não corresponde ao peso de uma página).

A busca inicial mantém estado, cidade/código e tipo à vista; aptidão, área e valor ficam no botão “Mais filtros” tanto no computador quanto no celular.
