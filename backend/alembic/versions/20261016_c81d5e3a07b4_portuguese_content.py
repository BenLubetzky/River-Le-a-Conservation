"""portuguese content

The website is now in European Portuguese, so the field-guide content goes over too: species
names and details, characteristics, removal steps, native look-alikes. Latin names and families stay.

Revision ID: c81d5e3a07b4
Revises: a4e7c2b19f53
Create Date: 2026-10-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c81d5e3a07b4"
down_revision: Union[str, Sequence[str], None] = "a4e7c2b19f53"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

INVASIVE = "Espécie invasora em Portugal (Decreto-Lei n.º 92/2019)"
INVASIVE_EU = "Espécie invasora em Portugal; lista de espécies que suscitam preocupação na UE"

# id: (common_name, native_range, flowering, habitat, legal_status, caution)
SPECIES = {
    "acacia": ("Mimosa", "Sudeste da Austrália", "Janeiro – março", "Margens, encostas e terrenos ardidos", INVASIVE,
               "Cortar apenas faz com que rebente da toiça e das raízes."),
    "arundo": ("Cana", "Ásia", "Agosto – novembro", "Margens do rio e valas húmidas", INVASIVE,
               "Nunca deixe caules ou raízes cortados perto da água; os fragmentos enraízam a jusante."),
    "tradescantia": ("Erva-da-fortuna", "América do Sul", "Primavera – outono", "Bosque ribeirinho húmido e sombrio", INVASIVE,
                     "Qualquer fragmento que fique pode dar origem a uma nova planta."),
    "pontederia": ("Jacinto-de-água", "Bacia amazónica", "Verão – outono", "Águas lentas e charcos", INVASIVE_EU,
                   "Vender, transportar ou libertar esta planta é proibido na UE."),
    "carpobrotus": ("Chorão", "África do Sul", "Março – julho", "Terrenos arenosos perto da foz", INVASIVE,
                    "Retire o tapete inteiro; os caules enterrados voltam a enraizar."),
    "cortaderia": ("Erva-das-pampas", "América do Sul", "Agosto – outubro", "Terrenos perturbados e bermas de estrada", INVASIVE,
                   "Use luvas grossas e proteção para os olhos; as folhas cortam."),
    "ipomoea": ("Bons-dias", "América tropical", "Primavera – outono", "Sebes e árvores ribeirinhas", INVASIVE,
                "Os caules cortados que ficam nas árvores continuam vivos durante semanas e podem voltar a enraizar."),
    "ailanthus": ("Espanta-lobos", "China", "Junho – julho", "Margens, muros e terrenos baldios", INVASIVE_EU,
                  "Cortar ou abater a árvore provoca uma enorme quantidade de rebentos de raiz."),
    "oxalis": ("Azedas", "África do Sul", "Novembro – abril", "Campos, bermas e margens", INVASIVE,
               "Cavar ou lavrar sem cuidado espalha os bolbilhos."),
}

LABELS = {"Form": "Porte", "Leaves": "Folhas", "Flowers": "Flores", "Fruit": "Fruto", "Spread": "Propagação",
          "Stems": "Caules", "Smell": "Cheiro", "Seeds": "Sementes", "Roots": "Raízes"}

# species_characteristics.id: text
CHARACTERISTICS = {
    1: "Árvore de folha persistente, normalmente com 5–15 m, que forma povoamentos densos.",
    2: "Plumosas, bipinadas, verde-azuladas e prateadas; folíolos muito pequenos.",
    3: "Amarelo-vivo, em bolinhas fofas reunidas em grandes cachos; aroma intenso.",
    4: "Vagens castanhas e achatadas, com sementes duras que se mantêm viáveis no solo durante décadas.",
    5: "Sementes e rebentos vigorosos a partir das raízes, sobretudo depois de um fogo ou de um corte.",
    35: "Árvore de folha caduca e crescimento rápido, até 20 m.",
    36: "Muito grandes (30–90 cm), com 11–25 folíolos, cada um com um dente glandular perto da base.",
    37: "As folhas e os caules esmagados têm um cheiro desagradável.",
    38: "Sementes aladas em cachos castanho-avermelhados.",
    39: "Sementes abundantes e rebentos de raiz.",
    6: "Gramínea perene gigante, com 2–6 m, em touceiras densas.",
    7: "Ocos, semelhantes a canas, com 2–4 cm de espessura, como o bambu.",
    8: "Largas (até 7 cm), verde-acinzentadas, abraçando o caule com uma base em forma de coração.",
    9: "Pluma grande, densa e plumosa, creme-clara.",
    10: "Rizomas grossos; fragmentos de caule e raiz arrastados pelas cheias.",
    21: "Planta suculenta rastejante que forma tapetes com vários metros.",
    22: "Carnudas, de secção triangular, curvas, de verdes a avermelhadas.",
    23: "Grandes, amarelas que passam a cor-de-rosa, com muitas pétalas estreitas.",
    24: "Carnudo, semelhante a um figo, comido e espalhado por animais.",
    25: "Caules que enraízam e sementes.",
    26: "Gramínea grande em touceira, com 2–4 m e plumas.",
    27: "Longas, estreitas, arqueadas, com margens cortantes como lâminas.",
    28: "Plumas branco-prateadas a rosadas, em hastes altas.",
    29: "Até um milhão por planta, levadas pelo vento.",
    30: "Touça densa com raízes fibrosas profundas.",
    31: "Trepadeira volúvel vigorosa, que abafa árvores e arbustos.",
    32: "Em forma de coração ou com três lóbulos, macias, pilosas.",
    33: "Em forma de trompete, azul-violeta, passando a cor-de-rosa à tarde.",
    34: "Estolhos que enraízam onde tocam no solo.",
    40: "Erva baixa, até 30 cm, que desaparece à superfície no verão.",
    41: "Semelhantes às do trevo, com três folíolos em forma de coração, muitas vezes com manchas roxas.",
    42: "Amarelo-vivo, em forma de funil, com cinco pétalas.",
    43: "Pequenos bolbilhos subterrâneos; em Portugal não produz sementes.",
    16: "Planta aquática flutuante que forma tapetes espessos sobre a água.",
    17: "Brilhantes, arredondadas, em rosetas; pecíolos inchados e esponjosos.",
    18: "Espigas de flores lilás; a pétala de cima tem uma mancha amarela.",
    19: "Escuras, plumosas, pendentes na água.",
    20: "Plantas-filhas em estolhos; pode duplicar em duas semanas.",
    11: "Erva rastejante baixa que forma tapetes densos com até 60 cm de espessura.",
    12: "Suculentos, articulados, enraízam em cada nó.",
    13: "Brilhantes, ovais, pontiagudas, com uma bainha à volta do caule.",
    14: "Pequenas, brancas, com três pétalas.",
    15: "Fragmentos de caule; qualquer pedaço com um nó pode voltar a crescer.",
}

# removal_steps.id: (title, text)
REMOVAL_STEPS = {
    1: ("Arrancar as plântulas", "Arranque à mão as plantas jovens com o solo húmido, retirando a raiz inteira."),
    2: ("Descascar as adultas em anel", "Retire uma faixa de casca de 20–30 cm à volta do tronco, até abaixo do câmbio, descendo até às raízes."),
    3: ("Deixar morrer de pé", "Deixe a árvore secar durante 1–2 anos antes de a abater."),
    4: ("Vigiar", "Volte todos os anos para arrancar as novas plântulas do banco de sementes."),
    29: ("Arrancar as plântulas", "Arranque as plantas jovens com a raiz inteira."),
    30: ("Tratar as adultas no local", "Os profissionais usam injeção no tronco ou descasque parcial em anel, no verão."),
    31: ("Abater quando estiver morta", "Retire a árvore só quando ela e as raízes estiverem mortas."),
    32: ("Vigiar os rebentos", "Arranque os rebentos de raiz durante vários anos."),
    5: ("Cortar repetidamente", "Corte os caules rente ao solo várias vezes por ano, para esgotar os rizomas."),
    6: ("Escavar os rizomas", "Em núcleos pequenos, escave toda a massa de rizomas."),
    7: ("Cobrir", "Cubra os núcleos cortados com tela escura e espessa durante pelo menos um ano."),
    8: ("Eliminar em segurança", "Seque e leve todo o material para bem longe do rio."),
    17: ("Arrancar à mão", "Levante a orla do tapete e enrole-o."),
    18: ("Retirar todos os fragmentos", "Peneire ou passe o ancinho na superfície para apanhar os pedaços que restem."),
    19: ("Levar para longe", "Ensaque e retire; sobrevive meses no chão."),
    20: ("Replantar espécies nativas", "Estabilize o solo descoberto com espécies nativas."),
    21: ("Cortar as plumas", "Antes de abrirem, corte e ensaque todas as plumas."),
    22: ("Cortar a folhagem", "Corte a touceira rente à touça."),
    23: ("Arrancar a touça", "Arranque toda a touça e as raízes com um alvião."),
    24: ("Vigiar as plântulas", "Verifique a zona no ano seguinte."),
    25: ("Cortar na base", "Corte todos os caules perto do solo."),
    26: ("Arrancar os estolhos", "Arranque os estolhos do solo e escave a raiz."),
    27: ("Retirar da copa", "Puxe para baixo os caules mortos, depois de secos."),
    28: ("Repetir", "Verifique em cada estação se voltou a crescer."),
    33: ("Escavar com cuidado", "Levante a planta inteira com o solo à volta do bolbo."),
    34: ("Peneirar o solo", "Retire todos os bolbilhos, por mais pequenos que sejam."),
    35: ("Agir antes do verão", "Retire-a antes de a planta secar e os bolbilhos ficarem escondidos."),
    36: ("Cobrir o solo", "Cubra a zona para que a sombra impeça a planta de voltar a crescer."),
    13: ("Conter", "Coloque barreiras flutuantes para impedir que o tapete desça o rio."),
    14: ("Retirar as plantas inteiras", "Levante-as com redes ou ancinhos, com todas as raízes."),
    15: ("Secar longe da água", "Amontoe bem acima do nível das cheias para secar."),
    16: ("Registar", "Registe todas as observações, para detetar cedo novos focos."),
    9: ("Arrancar à mão", "Enrole o tapete, trabalhando das orlas para o centro."),
    10: ("Recolher os fragmentos", "Passe o ancinho na zona e apanhe todos os pedaços de caule."),
    11: ("Ensacar", "Feche em sacos e deixe apodrecer, ou elimine como resíduo verde longe do rio."),
    12: ("Repetir", "Verifique a cada 2–3 meses se voltou a crescer."),
}

NATIVE_PLANTS = {
    "calystegia-sepium": "Corriola-grande",
    "convolvulus-arvensis": "Corriola",
    "cytisus-striatus": "Giesta-amarela",
    "ficaria-verna": "Celidónia-menor",
    "fraxinus-angustifolia": "Freixo",
    "hydrocharis-morsus-ranae": "Hidrócaris",
    "nymphaea-alba": "Nenúfar-branco",
    "phragmites-australis": "Caniço",
    "sedum-album": "Arroz-dos-telhados",
    "stellaria-holostea": "Estelária",
    "ulex-europaeus": "Tojo",
}

# (species_id, native_plant_id): (shared_traits, differences)
LOOK_ALIKES = {
    ("acacia", "cytisus-striatus"): (
        ["Flores amarelas", "Vagens", "Cresce em encostas"],
        ["Arbusto de caules verdes, quase sem folhas", "Flores em forma de borboleta, na primavera", "Vagens pilosas"]),
    ("acacia", "ulex-europaeus"): (
        ["Flores amarelas", "Floração no inverno", "Crescimento denso"],
        ["Arbusto espinhoso, raramente com mais de 2 m", "Flores em forma de borboleta, não bolinhas fofas", "Sem folhas plumosas, só espinhos"]),
    ("ailanthus", "fraxinus-angustifolia"): (
        ["Folhas pinadas", "Sementes aladas", "Margens de rios"],
        ["Folhas opostas no raminho", "Folíolos serrados em toda a margem", "Gomos escuros", "Sem mau cheiro"]),
    ("arundo", "phragmites-australis"): (
        ["Cana alta", "Pluma", "Solo húmido"],
        ["Caules mais finos, com menos de 1,5 cm", "Folhas mais estreitas, até 3 cm", "Pluma castanho-arroxeada", "Normalmente com 1–4 m de altura"]),
    ("carpobrotus", "sedum-album"): (
        ["Folhas suculentas", "Forma tapetes", "Solo seco e soalheiro"],
        ["Folhas minúsculas e cilíndricas, com menos de 1 cm", "Cachos de pequenas flores brancas em estrela", "Tapetes baixos, com poucos centímetros de altura"]),
    ("cortaderia", "phragmites-australis"): (
        ["Plumas altas", "Gramínea", "Floração no fim do verão"],
        ["Cresce na água, não em touceiras", "Folhas distribuídas ao longo do caule", "Folhas sem margens cortantes", "Plumas castanho-arroxeadas"]),
    ("ipomoea", "calystegia-sepium"): (
        ["Trepadeira volúvel", "Flores em trompete", "Sebes"],
        ["Flores brancas", "Folhas em forma de seta", "Crescimento menos denso"]),
    ("ipomoea", "convolvulus-arvensis"): (
        ["Flores em trompete", "Caules volúveis"],
        ["Flores pequenas, com 1–2 cm", "Brancas ou rosa-claro", "Crescimento baixo e rastejante"]),
    ("oxalis", "ficaria-verna"): (
        ["Flores amarelas", "Inverno e primavera", "Porte baixo"],
        ["8–12 pétalas brilhantes", "Folhas simples, brilhantes, em forma de coração", "Sem folhas divididas em três"]),
    ("pontederia", "hydrocharis-morsus-ranae"): (
        ["Rosetas flutuantes", "Folhas arredondadas"],
        ["Folhas muito mais pequenas, com 2–5 cm", "Três pétalas brancas", "Pecíolos finos, não esponjosos"]),
    ("pontederia", "nymphaea-alba"): (
        ["Folhas flutuantes", "Flores vistosas", "Águas paradas"],
        ["Enraizado no leito do rio", "Folhas planas com um corte profundo", "Flores brancas grandes", "Sem pecíolos inchados"]),
    ("tradescantia", "stellaria-holostea"): (
        ["Flores brancas", "Margens sombrias", "Porte baixo"],
        ["Cinco pétalas profundamente fendidas", "Folhas opostas e estreitas, como as das ervas", "Caules finos, quadrangulares, não suculentos"]),
}


def upgrade() -> None:
    db = op.get_bind()
    for id, (common, native_range, flowering, habitat, legal, caution) in SPECIES.items():
        db.execute(sa.text(
            "UPDATE species SET common_name = :common, native_range = :native_range, flowering = :flowering, "
            "habitat = :habitat, legal_status = :legal, caution = :caution WHERE id = :id"
        ), dict(id=id, common=common, native_range=native_range, flowering=flowering, habitat=habitat, legal=legal, caution=caution))
    for en, pt in LABELS.items():
        db.execute(sa.text("UPDATE species_characteristics SET label = :pt WHERE label = :en"), dict(en=en, pt=pt))
    for id, text in CHARACTERISTICS.items():
        db.execute(sa.text("UPDATE species_characteristics SET text = :text WHERE id = :id"), dict(id=id, text=text))
    for id, (title, text) in REMOVAL_STEPS.items():
        db.execute(sa.text("UPDATE removal_steps SET title = :title, text = :text WHERE id = :id"), dict(id=id, title=title, text=text))
    for id, name in NATIVE_PLANTS.items():
        db.execute(sa.text("UPDATE native_plants SET common_name = :name WHERE id = :id"), dict(id=id, name=name))
    for (species_id, native_id), (shared, differences) in LOOK_ALIKES.items():
        db.execute(sa.text(
            "UPDATE look_alikes SET shared_traits = :shared, differences = :differences "
            "WHERE species_id = :species_id AND native_plant_id = :native_id"
        ), dict(species_id=species_id, native_id=native_id, shared=shared, differences=differences))


def downgrade() -> None:
    # Content only: the English text is in the 69ba0a4dab7c migration if it's ever needed again.
    pass
