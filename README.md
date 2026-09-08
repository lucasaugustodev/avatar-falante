# Lucas Augusto — portfólio interativo

Um portfólio que responde por texto ou voz em português, apresentado por um avatar 3D. A página reúne o perfil profissional, áreas de atuação, projetos sugeridos e links públicos de Lucas Augusto.

A apresentação em primeira pessoa usa a voz do avatar, pré-gerada em `assets/introduction.wav`, com sincronização facial em `assets/introduction.json`. Ela tenta tocar assim que o personagem carrega; se o navegador bloquear autoplay, **Ativar som** inicia a mesma apresentação com um toque. Não é preciso abrir o microfone nem chamar a API para ouvir o oi. **Ouvir meu oi** repete a apresentação.

O avatar conversa como Lucas em primeira pessoa, com respostas de uma ou duas frases e aprofundamento quando solicitado. A apresentação destaca engenharia de software, treinamento e adaptação de modelos, agentes e DevOps. Os casos técnicos incluem LoRA, abliteração, qualidade de dados, avaliação de modelos, recursos de treino, deploy e consistência transacional. O histórico permite continuar um caso sem repetir a apresentação; 3D aparece quando é o assunto da pergunta. As respostas do chat não exibem links de projetos. A composição é responsiva, com o avatar integrado ao fundo e um modo de conversa que mantém o campo visível durante o uso do teclado mobile.

Página: https://lucasaugustodev.github.io/avatar-falante/

O modelo fornecido em `avatar with animation (2).glb` foi preparado no Blender. A exportação inclui a animação corporal original, oito poses de fala e um controle de piscar. Lábios, interior da boca, dentes inferiores e língua acompanham os mesmos pesos de fala. O relógio do áudio controla a sincronização labial no Three.js. Arraste o personagem ou use **Ver em 360°**.

O navegador renderiza o personagem e detecta as pausas pelo Silero VAD. A API independente em [Hugging Face](https://huggingface.co/spaces/augustolucasg/avatar-falante-api/tree/main) usa ElevenLabs Scribe v2 para transcrição, Orca Router para respostas e uma voz clonada da referência enviada para este avatar, com ElevenLabs Flash v2.5. O áudio PCM é montado em um único WAV e reproduzido pelo player nativo do navegador.

A referência atual da voz é um trecho de aproximadamente 59 segundos do vídeo fornecido pelo próprio Lucas. A preparação preserva a dinâmica e as pausas da gravação, removendo apenas as bordas sem fala. O vídeo e o áudio de referência ficam fora do repositório público.

O histórico da conversa fica no `localStorage` do próprio visitante e reaparece entre sessões no mesmo navegador. **Recomeçar** apaga esse histórico. Perguntas digitadas aparecem no chat; transcrições vindas do microfone continuam ocultas.

Uma chamada de IA que demora demais é substituída automaticamente por uma tentativa com outro modelo. A pergunta geral sobre tecnologias também tem uma resposta baseada nos fatos públicos para indisponibilidade dos provedores. Se a voz falhar, a resposta recebida aparece por escrito e a escuta pode continuar. A página limita a espera da conexão e detecta respostas interrompidas.

As respostas sobre Lucas usam somente um snapshot auditado do space congelado `portfolio-publico` do Recall. A exportação remove metadados internos e aceita apenas fatos profissionais, tecnologias, projetos e desafios técnicos anonimizados. As barreiras do servidor filtram contatos, documentos, credenciais, detalhes privados de infraestrutura, clientes e empregadores. Desafios de operação podem ser explicados em termos técnicos gerais. Perguntas sobre empresas ou marcas recebem somente as tecnologias públicas permitidas.

As credenciais ficam nos secrets do servidor. A conversa é pública, sem código de acesso. O gateway aplica limites de uso e não grava áudios ou transcrições em disco. O processamento pelos provedores segue as configurações dessas contas.

Para servir a página localmente: `python -m http.server 8868 --bind 127.0.0.1`. A URL da API está em `site/config.json`; as origens permitidas são configuradas em `AVATAR_ORIGINS` no servidor. Microfone exige HTTPS ou localhost e permissão após um toque.

Dependências de navegador estão fixadas em `assets/vendor`, com suas licenças: Three.js r180, ONNX Runtime e Silero VAD. O arquivo `assets/avatar-falante.glb` contém o personagem deste projeto.

A boca usa arcadas dentárias com gengiva e língua do MakeHuman, adaptadas ao personagem, com licença CC0. A cavidade acompanha os lábios e os dentes inferiores acompanham a mandíbula nas poses de fala. Fontes e licença: [assets/MAKEHUMAN-LICENSE.md](assets/MAKEHUMAN-LICENSE.md).
