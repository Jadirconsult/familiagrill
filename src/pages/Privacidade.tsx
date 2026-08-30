import { Link } from 'react-router-dom'
import { brand, dineInService } from '../data/site'
import { formatMinutes } from '../lib/hours'
import { medicaoLigada } from '../lib/track'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { LinkExterno } from '../components/LinkExterno'

/**
 * Aviso de privacidade.
 *
 * Curto de propósito: este site não tem formulário, não tem login e não tem
 * banco de dados. Não há cadastro de cliente para descrever — o que sobra é
 * dizer o que os terceiros embutidos na página fazem, e o que a medição faz
 * quando estiver ligada.
 *
 * REGRA DE OURO: cada frase aqui é uma afirmação verificável sobre o que o
 * código faz, não texto jurídico de modelo. Por isso a seção de medição não é
 * escrita à mão — ela lê `medicaoLigada`, o mesmo booleano que decide se o
 * gtag é baixado. Assim a página não tem como mentir: no dia em que alguém
 * preencher VITE_GA_ID, o texto muda junto, no mesmo build.
 *
 * Nenhuma classe nova: usa o `shell`, o `display`, o `eyebrow` e o
 * `brand-mark` que o resto do site já usa.
 */

/** Quando o texto mudar de verdade, atualize também esta data. */
const ATUALIZADA_EM = '29 de agosto de 2026'

const whatsapp = `https://wa.me/${brand.whatsapp}`

export function Privacidade() {
  return (
    <>
      <Header />
      <main>
        <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="shell">
            <p className="eyebrow">Privacidade</p>
            <h1 className="display mt-4 max-w-3xl text-[clamp(1.75rem,4.5vw,3.25rem)] text-cream">
              Este site não pede nada de você
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-smoke">
              Não há formulário, não há cadastro e não há login. Você lê o cardápio,
              vê o horário, acha o endereço e vai embora — ou clica num botão que
              leva ao aplicativo de entrega. Nada do que você faz aqui é guardado
              pela casa.
            </p>

            <div className="mt-14 grid gap-px bg-char sm:mt-16">
              <Bloco titulo="O que a casa guarda sobre você">
                <p>
                  <strong className="text-cream">Nada.</strong> A mesa é combinada
                  pelo WhatsApp, falando com o salão, e a conversa fica no seu
                  aplicativo de mensagens como qualquer outra — não passa por este
                  site nem por nenhum sistema da casa.
                </p>
              </Bloco>

              <Bloco titulo="O mapa desta página">
                <p>
                  A seção “Onde estamos” embute um mapa do Google. Para desenhá-lo,
                  o Google recebe o endereço de IP do seu aparelho e pode gravar
                  cookies próprios, sob a política de privacidade dele — a casa não
                  tem acesso a isso e não recebe nada em troca.
                </p>
                <p>
                  Se preferir evitar, o botão{' '}
                  <strong className="text-cream">Abrir no mapa</strong> leva ao mesmo
                  lugar sem carregar nada aqui dentro.
                </p>
              </Bloco>

              <Bloco titulo="Os botões que levam para fora">
                <p>
                  99Food, iFood, WhatsApp e o cardápio digital são serviços de
                  terceiros. A partir do clique, valem as políticas de privacidade
                  deles, não esta. A casa não envia nenhum dado seu junto com o
                  clique — o botão é um link comum.
                </p>
              </Bloco>

              <Medicao />

              <Bloco titulo="Seus direitos">
                <p>
                  A Lei Geral de Proteção de Dados garante que você peça acesso,
                  correção ou exclusão dos seus dados. Como esta casa não guarda
                  nenhum, não há registro a acessar nem a apagar — mas se você tiver
                  qualquer dúvida sobre isso, é só perguntar ao salão.
                </p>
                <div className="mt-6">
                  <LinkExterno
                    href={whatsapp}
                    evento="whatsapp"
                    className="inline-flex min-h-11 items-center border border-char px-5 py-3.5 font-mono text-xs font-bold tracking-widest text-cream uppercase transition-colors hover:border-gold hover:text-gold"
                  >
                    Falar com o salão
                  </LinkExterno>
                </div>
                <p className="mt-4 text-sm">
                  Todos os dias, das {formatMinutes(dineInService.open)} às{' '}
                  {formatMinutes(dineInService.close)}.
                </p>
              </Bloco>

              <Bloco titulo="Quem responde por esta página">
                <p>
                  {brand.fullName} — {brand.address.street}, {brand.address.city}/
                  {brand.address.state}.
                </p>
              </Bloco>
            </div>

            <p className="mt-12 font-mono text-xs tracking-widest text-smoke uppercase">
              Atualizada em {ATUALIZADA_EM}
            </p>

            <div className="mt-10">
              <Link
                to="/"
                className="inline-flex min-h-11 items-center font-mono text-xs font-bold tracking-widest text-gold uppercase transition-colors hover:text-cream"
              >
                ← Voltar para o site
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

/**
 * A única seção que muda sozinha.
 *
 * Enquanto VITE_GA_ID e VITE_ADS_ID estiverem vazios, nenhum script do Google é
 * baixado e esta seção diz exatamente isso. Preenchidos, o site passa a medir e
 * o texto passa a descrever a medição — sem depender de alguém lembrar de
 * reescrever a página. Era esse esquecimento o risco real: aviso de privacidade
 * desatualizado é pior do que aviso nenhum, porque afirma algo falso.
 */
function Medicao() {
  if (!medicaoLigada) {
    return (
      <Bloco titulo="Medição e propaganda">
        <p>
          Este site <strong className="text-cream">não carrega nenhum script de
          medição, propaganda ou rastreamento</strong>. Não há Google Analytics,
          não há pixel de rede social e não há cookie de rastreio. Nenhum dado de
          navegação sai do seu navegador.
        </p>
        <p>
          Se isso mudar, esta página muda no mesmo instante — ela lê a mesma
          configuração que liga a medição, então não tem como ficar desatualizada.
        </p>
      </Bloco>
    )
  }

  return (
    <Bloco titulo="Medição e propaganda">
      <p>
        Este site usa o Google Analytics e a etiqueta de conversão do Google Ads
        para contar <strong className="text-cream">quantas visitas viram
        pedido</strong> — quantas pessoas clicaram em 99Food, iFood, WhatsApp ou
        cardápio digital. É o que permite saber se vale a pena anunciar e onde.
      </p>
      <p>
        Para isso, o Google grava cookies no seu navegador e recebe o endereço de
        IP do aparelho. A casa vê apenas números somados — nunca quem é você.
        Nenhum nome, telefone ou endereço é coletado, porque este site não tem
        onde digitá-los.
      </p>
      <p>
        Para recusar, use o bloqueio de cookies do seu navegador ou a navegação
        anônima. Nada do site deixa de funcionar sem a medição.
      </p>
    </Bloco>
  )
}

/** Um bloco da lista, no mesmo desenho das janelas de expediente. */
function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-coal p-6 sm:p-8 lg:p-10">
      <h2 className="brand-mark">{titulo}</h2>
      <div className="mt-4 max-w-2xl space-y-4 leading-relaxed text-smoke">{children}</div>
    </div>
  )
}
