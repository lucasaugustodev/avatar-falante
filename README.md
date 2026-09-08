# Avatar Falante

Um personagem 3D com conversa por voz em português: ative o microfone uma vez, fale e espere a resposta. A escuta continua automaticamente após cada fala. A página não exibe transcrições.

Página: https://lucasaugustodev.github.io/avatar-falante/

O modelo fornecido em `avatar with animation (2).glb` foi preparado no Blender. A exportação inclui a animação corporal original, oito poses de fala e um controle de piscar. Lábios, interior da boca, dentes inferiores e língua acompanham os mesmos pesos de fala. O relógio do áudio controla a sincronização labial no Three.js. Arraste o personagem ou use **Ver em 360°**.

O navegador renderiza o personagem e detecta as pausas pelo Silero VAD. A API independente em [Hugging Face](https://huggingface.co/spaces/augustolucasg/avatar-falante-api/tree/main) usa ElevenLabs Scribe v2 para transcrição, Orca Router para respostas e a voz Eric com ElevenLabs Flash v2.5. O áudio PCM é montado em um único WAV e reproduzido pelo player nativo do navegador.

As credenciais ficam nos secrets do servidor. A conversa é pública, sem código de acesso. O gateway aplica limites de uso e não grava áudios ou transcrições em disco. O processamento pelos provedores segue as configurações dessas contas.

Para servir a página localmente: `python -m http.server 8868 --bind 127.0.0.1`. A URL da API está em `site/config.json`; as origens permitidas são configuradas em `AVATAR_ORIGINS` no servidor. Microfone exige HTTPS ou localhost e permissão após um toque.

Dependências de navegador estão fixadas em `assets/vendor`, com suas licenças: Three.js r180, ONNX Runtime e Silero VAD. O arquivo `assets/avatar-falante.glb` contém o personagem deste projeto.

A boca usa arcadas dentárias com gengiva e língua do MakeHuman, adaptadas ao personagem, com licença CC0. A cavidade acompanha os lábios e os dentes inferiores acompanham a mandíbula nas poses de fala. Fontes e licença: [assets/MAKEHUMAN-LICENSE.md](assets/MAKEHUMAN-LICENSE.md).
