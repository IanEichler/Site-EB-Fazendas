# EB Fazendas

Site completo da EB Fazendas, com identidade em marrom e bege, logo original, catálogo de 34 propriedades e 705 fotografias locais.

Interface em HTML, CSS e JavaScript, sem dependências de produção. Inclui busca, filtros, ordenação, paginação, favoritos no navegador, galerias, vídeos e contato direto por WhatsApp. No celular, há navegação fixa, filtros em painel, áreas de toque maiores e gestos horizontais na galeria. As animações respeitam a preferência de movimento reduzido.

## Publicar na Vercel

1. Importe o repositório `IanEichler/Site-EB-Fazendas` na Vercel.
2. Mantenha a raiz do projeto como `./`.
3. Use o preset **Other**, caso o painel peça um framework.
4. Publique com o comando `npm run build` e a pasta de saída `dist`.

Essas configurações já estão no `vercel.json`. Não é necessário configurar variáveis de ambiente. O build copia somente os arquivos públicos para `dist`; o servidor local e os arquivos de desenvolvimento ficam fora da pasta publicada.

As regras de reescrita mantêm as páginas internas acessíveis por links diretos e ao atualizar o navegador:

- `/`
- `/propriedades` — parâmetros de busca, filtros, ordenação e favoritos
- `/imovel/2` — detalhes; o mesmo padrão atende cada ID do catálogo
- `/quero-vender`
- `/contato` e `/contato?imovel=2`

O arquivo `404.html` gerado pelo build utiliza a tela de página não encontrada do próprio site.

## Executar localmente

Com Node.js 18 ou superior:

```sh
npm start
```

Abra `http://localhost:3000`. No Windows, também é possível executar `iniciar.bat`.

```sh
npm run check
npm run build
```

O primeiro comando verifica a sintaxe dos módulos. O segundo verifica os arquivos locais do catálogo e gera a pasta `dist`.

## Estrutura

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura compartilhada, logo, ícones e diálogos |
| `site.js` | Rotas, catálogo, filtros, favoritos e galerias |
| `styles.css`, `site.css`, `brown.css` | Base visual e identidade |
| `hero.css` | Capa institucional, composição de abertura e imagens responsivas |
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

A fotografia, o nome e a logo da EB Fazendas permanecem identificados como conteúdo da marca. O ícone de WhatsApp utiliza Bootstrap Icons; sua licença está em `assets/icons/bootstrap-icons-LICENSE.txt`.

As fontes Manrope e DM Serif Display são distribuídas com suas licenças em `assets/licenses/`.

## Fotografias e capa

A abertura utiliza uma paisagem ilustrativa criada com imagegen, identificada no site e sem vínculo com um imóvel anunciado. O prompt e a origem estão em `assets/hero/README.txt`. As capas e as galerias dos anúncios continuam usando fotografias reais dos respectivos imóveis, com as marcas originais preservadas.

Os cards utilizam variantes WebP em 480 e 800 pixels por meio de `picture` e `srcset`; o JPEG original permanece como fallback. Os arquivos originais de galeria permanecem disponíveis em resolução integral. Ao adicionar um imóvel, `cardImage` é opcional; sem variantes, o card usa `cover`.
