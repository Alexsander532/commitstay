"""Popula o banco com dados de demonstração."""
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand

from accounts.models import User
from bookings.models import Booking
from properties.models import Amenity, Photo, Property, Review

AMENITIES = [
    ("Wi-Fi", "📶"), ("Piscina", "🏊"), ("Ar-condicionado", "❄️"),
    ("Cozinha equipada", "🍳"), ("Estacionamento", "🚗"), ("TV", "📺"),
    ("Máquina de lavar", "🧺"), ("Churrasqueira", "🍖"), ("Academia", "🏋️"),
    ("Pet friendly", "🐶"), ("Vista para o mar", "🌊"), ("Varanda", "🪴"),
    ("Hidromassagem", "🛁"), ("Lareira", "🔥"), ("Café da manhã incluso", "☕"),
    ("Acessibilidade", "♿"),
]

U = "https://images.unsplash.com/photo-{}?w=900&q=80"

PROPERTIES = [
    # ── Florianópolis ──────────────────────────────────────────────────────
    {
        "title": "Casa de praia com vista para o mar",
        "description": (
            "Casa espaçosa a 50 m da praia de Jurerê Internacional. "
            "Varanda ampla com rede e hamaca, churrasqueira coberta e quintal com piscina aquecida. "
            "Perfeita para famílias e grupos de amigos. A cozinha é totalmente equipada com forno, "
            "micro-ondas e cafeteira de cápsulas. Dorme confortavelmente 8 pessoas em 4 suítes."
        ),
        "address": "Rua das Conchas, 120", "city": "Florianópolis", "state": "SC",
        "lat": "-27.595378", "lng": "-48.548050", "price": "350.00", "guests": 8,
        "amenities": ["Wi-Fi", "Piscina", "Churrasqueira", "Vista para o mar", "Estacionamento", "Cozinha equipada", "TV"],
        "photos": [
            "1499793983690-e29da59ef1c2", "1505843513577-22bb7d21e455",
            "1512917774080-9991f1c4c750", "1523217582562-09d8375d4a40",
        ],
        "reviews": [
            ("Hugo Hóspede", 5, "Casa incrível! A vista para o mar ao amanhecer é de tirar o fôlego. Voltaremos com certeza."),
            ("Marina Mochileira", 5, "Piscina perfeita, churrasqueira ótima. O anfitrião foi super atencioso. Recomendo demais!"),
            ("Lucas Viajante", 5, "Melhor hospedagem que já tive em Floripa. Localização privilegiada, casa impecável."),
        ],
    },
    # ── São Paulo (Paulista) ───────────────────────────────────────────────
    {
        "title": "Apartamento moderno na Av. Paulista",
        "description": (
            "Apê completamente reformado a 2 min a pé da Av. Paulista. "
            "Decoração minimalista com móveis design, cozinha gourmet e home office com monitor. "
            "Ideal para viagens de trabalho, city breaks e casais. "
            "Próximo ao MASP, Parque Trianon e estações de metrô Brigadeiro e Paulista."
        ),
        "address": "Rua Augusta, 1050, ap. 92", "city": "São Paulo", "state": "SP",
        "lat": "-23.563987", "lng": "-46.654386", "price": "220.00", "guests": 3,
        "amenities": ["Wi-Fi", "Ar-condicionado", "TV", "Cozinha equipada", "Academia", "Máquina de lavar"],
        "photos": [
            "1522708323590-d24dbb6b0267", "1502672260266-1c1ef2d93688",
            "1560448204-e02f11c3d0e2", "1556909114-f6e7ad7d3136",
        ],
        "reviews": [
            ("Hugo Hóspede", 4, "Localização perfeita, a 5 min do metrô. Apartamento exatamente como nas fotos."),
            ("Fernanda Turista", 5, "Adorei! Espaço limpo, moderno e muito bem equipado. Voltaria sem pensar."),
        ],
    },
    # ── Gramado ───────────────────────────────────────────────────────────
    {
        "title": "Chalé na serra com lareira e hidromassagem",
        "description": (
            "Chalé premium em condomínio fechado no coração da Serra Gaúcha. "
            "Lareira a lenha na sala, banheira de hidromassagem no quarto master, "
            "café da manhã colonial servido diariamente e vista para o vale coberto de neblina. "
            "Perfeito para lua de mel, aniversários e retiros românticos."
        ),
        "address": "Estrada do Caracol, km 7", "city": "Gramado", "state": "RS",
        "lat": "-29.378569", "lng": "-50.873447", "price": "480.00", "guests": 4,
        "amenities": ["Wi-Fi", "TV", "Cozinha equipada", "Estacionamento", "Pet friendly", "Varanda", "Hidromassagem", "Lareira", "Café da manhã incluso"],
        "photos": [
            "1542718610-a1d656d1884c", "1449158743715-0a90ebb6d2d8",
            "1518780664697-55e3ad937233", "1586105251261-72a756497a11",
        ],
        "reviews": [
            ("Hugo Hóspede", 5, "Chalé perfeito para o frio de Gramado. Lareira funcionando, hidromassagem quentíssima e café delicioso!"),
            ("Beatriz Casada", 5, "Passamos nossa lua de mel aqui. Cada detalhe foi pensado com carinho. Nota 1000!"),
            ("Roberto Família", 4, "Ótima estrutura. Minha única ressalva é que o acesso pela estrada de terra fica complicado com chuva."),
        ],
    },
    # ── Rio de Janeiro ────────────────────────────────────────────────────
    {
        "title": "Cobertura com piscina em Copacabana",
        "description": (
            "Cobertura duplex de alto padrão com piscina privativa e deck na frente, "
            "vista panorâmica de 180° da Praia de Copacabana e do Pão de Açúcar. "
            "3 quartos (2 suítes), sala de estar ampla com sofás de couro, "
            "cozinha gourmet e área de grelha. Condomínio com portaria 24h e vaga de garagem."
        ),
        "address": "Av. Atlântica, 3000, cobertura", "city": "Rio de Janeiro", "state": "RJ",
        "lat": "-22.971177", "lng": "-43.182543", "price": "890.00", "guests": 6,
        "amenities": ["Wi-Fi", "Piscina", "Ar-condicionado", "Vista para o mar", "TV", "Varanda", "Estacionamento", "Churrasqueira"],
        "photos": [
            "1502005229762-cf1b2da7c5d6", "1493809842364-78817add7ffb",
            "1560185007-cde436f6a4d0", "1571003123894-1eeef4b6b60d",
        ],
        "reviews": [
            ("Marina Mochileira", 4, "Vista incrível! A piscina privativa é o destaque. O imóvel poderia ter modernizado um pouco a decoração."),
            ("Carlos Executivo", 5, "Trouxe clientes para uma reunião aqui. Impressionante! O Rio de Janeiro visto de cima é outro nível."),
        ],
    },
    # ── São Paulo (Vila Madalena) ──────────────────────────────────────────
    {
        "title": "Loft industrial na Vila Madalena",
        "description": (
            "Loft de 90 m² com pé-direito duplo de 4 m, tijolo à vista, "
            "vigas de ferro e janelão industrial dando para um jardim privativo. "
            "Área de trabalho com bancada, monitor externo e cadeira ergonômica. "
            "A dois quarteirões do Bar Skol, escadaria do Masp e Vila Madalena."
        ),
        "address": "Rua Harmonia, 700", "city": "São Paulo", "state": "SP",
        "lat": "-23.564224", "lng": "-46.682129", "price": "310.00", "guests": 2,
        "amenities": ["Wi-Fi", "Ar-condicionado", "TV", "Máquina de lavar", "Cozinha equipada"],
        "photos": [
            "1536376072261-38c75010e6c9", "1554995207-c18c203602cb",
            "1556020685-ae41abfc9365", "1595526051689-a04a69fd99ab",
        ],
        "reviews": [
            ("Fernanda Turista", 5, "O loft é exatamente o que mostram nas fotos. Muito estiloso e super bem localizado."),
        ],
    },
    # ── Salvador ──────────────────────────────────────────────────────────
    {
        "title": "Casa colonial no coração do Pelourinho",
        "description": (
            "Casa histórica do século XVIII restaurada com muito cuidado, "
            "mantendo azulejos portugueses originais e pé-direito de 3,5 m. "
            "Pátio interno com jardim, área de lazer coberta e cozinha equipada com temperos regionais. "
            "A 5 min a pé da Igreja do Carmo e de bares de axé e samba."
        ),
        "address": "Largo do Pelourinho, 15", "city": "Salvador", "state": "BA",
        "lat": "-12.971398", "lng": "-38.508797", "price": "260.00", "guests": 5,
        "amenities": ["Wi-Fi", "Ar-condicionado", "Cozinha equipada", "Varanda", "TV"],
        "photos": [
            "1564013799919-ab600027ffc6", "1513584684374-8bab748fbf90",
            "1505691938895-1758d7feb511", "1534430480872-2b13d9fc4c27",
        ],
        "reviews": [
            ("Lucas Viajante", 5, "Adorei a história do lugar. Acordar no Pelourinho com música baiana é mágico."),
            ("Beatriz Casada", 4, "Ótima localização e espaço lindo. Só o ruído da rua à noite pode incomodar quem dorme cedo."),
        ],
    },
    # ── Jericoacoara ──────────────────────────────────────────────────────
    {
        "title": "Bangalô pé na areia em Jericoacoara",
        "description": (
            "Bangalô rústico-chic a 20 passos da areia mais bela do Nordeste. "
            "Varanda com duas redes, mobília artesanal, ventilador de teto e "
            "café da manhã com frutas tropicais, tapioca e coco verde gelado. "
            "Jantar opcional com peixe fresco e lagosta sob consulta."
        ),
        "address": "Rua do Forró, 8", "city": "Jijoca de Jericoacoara", "state": "CE",
        "lat": "-2.794322", "lng": "-40.512474", "price": "420.00", "guests": 2,
        "amenities": ["Wi-Fi", "Vista para o mar", "Varanda", "Pet friendly", "Café da manhã incluso"],
        "photos": [
            "1520250497591-112f2f40a3f4", "1571896349842-33c89424de2d",
            "1582719478250-c89cae4dc85b", "1507525428034-b723cf961d3e",
        ],
        "reviews": [
            ("Marina Mochileira", 5, "Experiência única em Jeri! Acordar com o som do mar e tomar café na varanda foi perfeito."),
            ("Roberto Família", 5, "Melhor hospedagem da viagem. O café da manhã é sensacional!"),
        ],
    },
    # ── Curitiba ──────────────────────────────────────────────────────────
    {
        "title": "Apartamento aconchegante no Batel",
        "description": (
            "Apartamento de alto padrão no sofisticado bairro do Batel, "
            "a 10 min do Jardim Botânico e 5 min dos melhores restaurantes de Curitiba. "
            "Cozinha completa, lavanderia, vaga na garagem e academia no condomínio. "
            "Excelente para famílias e profissionais em viagem de negócios."
        ),
        "address": "Alameda Cabral, 1200, ap. 45", "city": "Curitiba", "state": "PR",
        "lat": "-25.428954", "lng": "-49.267137", "price": "180.00", "guests": 4,
        "amenities": ["Wi-Fi", "TV", "Cozinha equipada", "Máquina de lavar", "Estacionamento", "Academia"],
        "photos": [
            "1484154218962-a197022b5858", "1486304873000-235643847519",
            "1493663284031-b7e3aefcae8e", "1560185127-6ed189168fc1",
        ],
        "reviews": [
            ("Carlos Executivo", 5, "Perfeito para trabalho. Silencioso, bem equipado e ótima localização."),
            ("Fernanda Turista", 4, "Aconchegante e limpo. A academia no condomínio foi um bônus incrível."),
        ],
    },
    # ── Manaus (novo) ─────────────────────────────────────────────────────
    {
        "title": "Casa flutuante na orla do Rio Negro",
        "description": (
            "Experiência única: uma casa flutuante com deck sobre as águas escuras do Rio Negro. "
            "Quartos climatizados, sala com vista 360° para a floresta e serviço de barco para passeios. "
            "Inclui café da manhã com frutas amazônicas e jantar típico na primeira noite."
        ),
        "address": "Porto do Mindú, km 3", "city": "Manaus", "state": "AM",
        "lat": "-3.119028", "lng": "-60.021731", "price": "540.00", "guests": 5,
        "amenities": ["Wi-Fi", "Ar-condicionado", "Cozinha equipada", "Varanda", "Café da manhã incluso", "Pet friendly"],
        "photos": [
            "1516026672322-375526ef6f3c", "1500534314209-a25ddb2bd429",
            "1441974231531-c6227db76b6e", "1518548419970-58e3b4079ab2",
        ],
        "reviews": [],
    },
    # ── Bonito (novo) ─────────────────────────────────────────────────────
    {
        "title": "Eco-lodge à beira do Rio da Prata",
        "description": (
            "Eco-lodge sustentável na beira do cristalíssimo Rio da Prata, "
            "com deck privativo para flutuação e trilha particular na mata. "
            "Construção em madeira de reflorestamento, energia solar e "
            "cardápio 100% orgânico. Dorme 6 em 3 quartos."
        ),
        "address": "Estrada da Prata, s/n", "city": "Bonito", "state": "MS",
        "lat": "-21.121338", "lng": "-56.474220", "price": "620.00", "guests": 6,
        "amenities": ["Wi-Fi", "Cozinha equipada", "Varanda", "Estacionamento", "Café da manhã incluso", "Pet friendly", "Churrasqueira"],
        "photos": [
            "1501854140801-50d01698950b", "1518098268026-4462afbbc257",
            "1456926631375-92c8ce872def", "1510227272981-d9060c6e3b44",
        ],
        "reviews": [],
    },
    # ── Recife (novo) ─────────────────────────────────────────────────────
    {
        "title": "Flat com vista para o mar em Boa Viagem",
        "description": (
            "Flat moderno no 18º andar com vista lateral para o mar de Boa Viagem. "
            "Condomínio com piscina, academia, sauna e portaria 24h. "
            "A 3 min a pé da praia e do Parque dos Manguezais. "
            "Ideal para famílias ou grupos de até 4 pessoas."
        ),
        "address": "Av. Boa Viagem, 2200, flat 1802", "city": "Recife", "state": "PE",
        "lat": "-8.117783", "lng": "-34.900509", "price": "240.00", "guests": 4,
        "amenities": ["Wi-Fi", "Piscina", "Ar-condicionado", "TV", "Academia", "Vista para o mar", "Estacionamento"],
        "photos": [
            "1507525428034-b723cf961d3e", "1520250497591-112f2f40a3f4",
            "1449158743715-0a90ebb6d2d8", "1560448204-e02f11c3d0e2",
        ],
        "reviews": [],
    },
    # ── Belo Horizonte (novo) ─────────────────────────────────────────────
    {
        "title": "Studio minimalista no Savassi",
        "description": (
            "Studio de 55 m² com design minimalista no vibrante bairro do Savassi. "
            "Cozinha compacta totalmente equipada, banheiro com chuveiro de efeito chuva, "
            "mesa de trabalho e smart TV. A 2 quarteirões do Mercado Central e de dezenas de bares e restaurantes."
        ),
        "address": "Rua Fernandes Tourinho, 380, ap. 5", "city": "Belo Horizonte", "state": "MG",
        "lat": "-19.935926", "lng": "-43.930386", "price": "155.00", "guests": 2,
        "amenities": ["Wi-Fi", "Ar-condicionado", "TV", "Cozinha equipada", "Máquina de lavar"],
        "photos": [
            "1554995207-c18c203602cb", "1556020685-ae41abfc9365",
            "1536376072261-38c75010e6c9", "1502672260266-1c1ef2d93688",
        ],
        "reviews": [],
    },
    # ── Porto de Galinhas (novo) ───────────────────────────────────────────
    {
        "title": "Villa tropical em Porto de Galinhas",
        "description": (
            "Villa com 3 suítes, piscina privativa e jardim tropical a 400 m "
            "das icônicas piscinas naturais de Porto de Galinhas. "
            "Sala de estar com sofás puff, cozinha gourmet e churrasqueira. "
            "Perfeita para famílias ou grupos de amigos em busca do Nordeste mais bonito."
        ),
        "address": "Rua Beijupirá, 220", "city": "Porto de Galinhas", "state": "PE",
        "lat": "-8.699800", "lng": "-35.003600", "price": "780.00", "guests": 8,
        "amenities": ["Wi-Fi", "Piscina", "Churrasqueira", "Vista para o mar", "Cozinha equipada", "TV", "Estacionamento", "Pet friendly"],
        "photos": [
            "1582719478250-c89cae4dc85b", "1507525428034-b723cf961d3e",
            "1512917774080-9991f1c4c750", "1505843513577-22bb7d21e455",
        ],
        "reviews": [],
    },
    # ── Foz do Iguaçu (novo) ──────────────────────────────────────────────
    {
        "title": "Pousada à beira das Cataratas",
        "description": (
            "Pousada boutique a 2 km da entrada do Parque Nacional do Iguaçu. "
            "Quartos com varanda privativa voltada para a mata atlântica, "
            "café da manhã farto, piscina e serviço de traslado para as Cataratas. "
            "Perfeita para quem quer máxima comodidade perto da maior maravilha natural do Brasil."
        ),
        "address": "Av. das Cataratas, 2001", "city": "Foz do Iguaçu", "state": "PR",
        "lat": "-25.421667", "lng": "-54.595833", "price": "390.00", "guests": 4,
        "amenities": ["Wi-Fi", "Piscina", "Ar-condicionado", "TV", "Café da manhã incluso", "Estacionamento", "Varanda"],
        "photos": [
            "1441974231531-c6227db76b6e", "1518548419970-58e3b4079ab2",
            "1516026672322-375526ef6f3c", "1456926631375-92c8ce872def",
        ],
        "reviews": [],
    },
    # ── Brasília (novo) ───────────────────────────────────────────────────
    {
        "title": "Apartamento design no Plano Piloto",
        "description": (
            "Apartamento de arquitetura modernista no coração do Plano Piloto de Brasília. "
            "Alto padrão, 2 quartos, sala com sofá de couro e vista para o gramado dos blocos residenciais. "
            "A 10 min do Congresso Nacional, CCBB e Museu Nacional."
        ),
        "address": "SQN 311 Bloco A, ap. 210", "city": "Brasília", "state": "DF",
        "lat": "-15.775357", "lng": "-47.929397", "price": "290.00", "guests": 4,
        "amenities": ["Wi-Fi", "Ar-condicionado", "TV", "Cozinha equipada", "Máquina de lavar", "Estacionamento"],
        "photos": [
            "1502005229762-cf1b2da7c5d6", "1493809842364-78817add7ffb",
            "1534430480872-2b13d9fc4c27", "1564013799919-ab600027ffc6",
        ],
        "reviews": [],
    },
    # ── Chapada Diamantina (novo) ──────────────────────────────────────────
    {
        "title": "Chalé com vista para a Chapada Diamantina",
        "description": (
            "Chalé rústico no alto de uma colina com vista espetacular para os vales da Chapada Diamantina. "
            "Construção em pedra e madeira, fogão a lenha, piscina natural e acesso direto a trilhas. "
            "O céu noturno aqui é puro show de estrelas."
        ),
        "address": "Sítio Vista Bela, km 12 da BA-142", "city": "Mucugê", "state": "BA",
        "lat": "-13.000500", "lng": "-41.371000", "price": "340.00", "guests": 5,
        "amenities": ["Wi-Fi", "Cozinha equipada", "Varanda", "Estacionamento", "Pet friendly", "Lareira", "Café da manhã incluso"],
        "photos": [
            "1586105251261-72a756497a11", "1518780664697-55e3ad937233",
            "1449158743715-0a90ebb6d2d8", "1542718610-a1d656d1884c",
        ],
        "reviews": [],
    },
    # ── São Paulo (Vila Mariana) ───────────────────────────────────────────
    {
        "title": "Suíte aconchegante na Vila Mariana",
        "description": "Suíte privativa em vilinha tranquila, a 10 min do Parque Ibirapuera e da Av. Paulista. Banheiro exclusivo, Wi-Fi rápido e área compartilhada com quintal arborizado.",
        "address": "Rua Domingos de Morais, 1450", "city": "São Paulo", "state": "SP",
        "lat": "-23.589200", "lng": "-46.634100", "price": "195.00", "guests": 2,
        "amenities": ["Wi-Fi", "Ar-condicionado", "TV", "Cozinha equipada", "Varanda"],
        "photos": ["1560448204-e02f11c3d0e2", "1522708323590-d24dbb6b0267", "1502672260266-1c1ef2d93688", "1556909114-f6e7ad7d3136"],
        "reviews": [
            ("Marina Mochileira", 5, "Localização perfeita! Suite limpa e anfitriã super atenciosa."),
            ("Lucas Viajante", 5, "Adorei a vilinha, muito silenciosa. Voltaria com certeza."),
            ("Fernanda Turista", 5, "Perto do metrô e do Ibirapuera. Experiência nota 10."),
        ],
    },
    {
        "title": "Studio compacto em Pinheiros",
        "description": "Studio moderno a 3 min do metrô Faria Lima. Ideal para profissionais e casais. Cozinha equipada, ar-condicionado e área de trabalho.",
        "address": "Rua dos Pinheiros, 800", "city": "São Paulo", "state": "SP",
        "lat": "-23.567500", "lng": "-46.693200", "price": "175.00", "guests": 2,
        "amenities": ["Wi-Fi", "Ar-condicionado", "TV", "Cozinha equipada", "Máquina de lavar"],
        "photos": ["1554995207-c18c203602cb", "1536376072261-38c75010e6c9", "1556020685-ae41abfc9365", "1595526051689-a04a69fd99ab"],
        "reviews": [("Carlos Executivo", 5, "Perfeito para trabalho remoto. Internet excelente."), ("Hugo Hóspede", 4, "Ótima localização e espaço funcional.")],
    },
    {
        "title": "Apartamento familiar no Morumbi",
        "description": "Apartamento de 3 quartos em condomínio com piscina e playground. Ideal para famílias. Garagem coberta e portaria 24h.",
        "address": "Av. Giovanni Gronchi, 5200", "city": "São Paulo", "state": "SP",
        "lat": "-23.623400", "lng": "-46.720100", "price": "380.00", "guests": 6,
        "amenities": ["Wi-Fi", "Piscina", "Ar-condicionado", "TV", "Estacionamento", "Academia", "Cozinha equipada"],
        "photos": ["1502005229762-cf1b2da7c5d6", "1493809842364-78817add7ffb", "1560185007-c18c203602cb", "1484154218962-a197022b5858"],
        "reviews": [("Roberto Família", 5, "Excelente para família com crianças. Condomínio muito seguro.")],
    },
    {
        "title": "Quarto charmoso em Santa Ifigênia",
        "description": "Quarto privativo no centro histórico, perto do metrão e do Mercado Municipal. Decoração retrô e café da manhã incluso.",
        "address": "Rua Santa Ifigênia, 250", "city": "São Paulo", "state": "SP",
        "lat": "-23.541200", "lng": "-46.634800", "price": "120.00", "guests": 2,
        "amenities": ["Wi-Fi", "Café da manhã incluso", "TV", "Ar-condicionado"],
        "photos": ["1564013799919-ab600027ffc6", "1513584684374-8bab748fbf90", "1505691938895-1758d7feb511", "1534430480872-2b13d9fc4c27"],
        "reviews": [("Beatriz Casada", 5, "Charmoso e bem localizado. Café da manhã delicioso!")],
    },
    {
        "title": "Cobertura duplex no Itaim Bibi",
        "description": "Cobertura luxuosa com terraço gourmet e vista para a cidade. 2 suítes, sala ampla e 2 vagas de garagem.",
        "address": "Rua Bandeira Paulista, 400", "city": "São Paulo", "state": "SP",
        "lat": "-23.581700", "lng": "-46.677800", "price": "650.00", "guests": 4,
        "amenities": ["Wi-Fi", "Piscina", "Ar-condicionado", "Churrasqueira", "TV", "Estacionamento", "Academia"],
        "photos": ["1571003123894-1eeef4b6b60d", "1560185007-cde436f6a4d0", "1493809842364-78817add7ffb", "1502005229762-cf1b2da7c5d6"],
        "reviews": [("Carlos Executivo", 5, "Impressionante! Vista e acabamento de alto padrão.")],
    },
    {
        "title": "Loft criativo na Liberdade",
        "description": "Loft artístico no bairro da Liberdade, perto de restaurantes japoneses e do metrô. Decoração única com obras de arte locais.",
        "address": "Rua Galvão Bueno, 180", "city": "São Paulo", "state": "SP",
        "lat": "-23.558900", "lng": "-46.634500", "price": "245.00", "guests": 3,
        "amenities": ["Wi-Fi", "Ar-condicionado", "TV", "Cozinha equipada", "Varanda"],
        "photos": ["1536376072261-38c75010e6c9", "1554995207-c18c203602cb", "1556020685-ae41abfc9365", "1522708323590-d24dbb6b0267"],
        "reviews": [],
    },
    # ── Rio de Janeiro ─────────────────────────────────────────────────────
    {
        "title": "Studio em Ipanema a 2 quadras da praia",
        "description": "Studio reformado em Ipanema, a poucos passos da praia e do metrô. Varanda com rede e vista parcial do mar.",
        "address": "Rua Visconde de Pirajá, 350", "city": "Rio de Janeiro", "state": "RJ",
        "lat": "-22.984100", "lng": "-43.210200", "price": "320.00", "guests": 2,
        "amenities": ["Wi-Fi", "Ar-condicionado", "TV", "Vista para o mar", "Cozinha equipada"],
        "photos": ["1507525428034-b723cf961d3e", "1520250497591-112f2f40a3f4", "1571896349842-33c89424de2d", "1582719478250-c89cae4dc85b"],
        "reviews": [
            ("Marina Mochileira", 5, "Ipanema é Ipanema! Studio perfeito para casal."),
            ("Fernanda Turista", 5, "Localização imbatível. Pé na areia em 2 minutos."),
        ],
    },
    {
        "title": "Apartamento em Botafogo com vista",
        "description": "Apartamento ensolarado em Botafogo com vista para o Pão de Açúcar. Próximo ao metrô e à Praia de Botafogo.",
        "address": "Rua Voluntários da Pátria, 120", "city": "Rio de Janeiro", "state": "RJ",
        "lat": "-22.951800", "lng": "-43.186500", "price": "275.00", "guests": 4,
        "amenities": ["Wi-Fi", "Ar-condicionado", "TV", "Cozinha equipada", "Varanda"],
        "photos": ["1493809842364-78817add7ffb", "1502005229762-cf1b2da7c5d6", "1560185007-cde436f6a4d0", "1571003123894-1eeef4b6b60d"],
        "reviews": [("Lucas Viajante", 4, "Vista linda e bairro tranquilo. Recomendo!")],
    },
    {
        "title": "Quarto em Santa Teresa com charme",
        "description": "Quarto em casa histórica de Santa Teresa com jardim e café colonial. Experiência autêntica carioca.",
        "address": "Rua Almirante Alexandrino, 450", "city": "Rio de Janeiro", "state": "RJ",
        "lat": "-22.920500", "lng": "-43.183200", "price": "165.00", "guests": 2,
        "amenities": ["Wi-Fi", "Café da manhã incluso", "Varanda", "TV"],
        "photos": ["1513584684374-8bab748fbf90", "1564013799919-ab600027ffc6", "1505691938895-1758d7feb511", "1534430480872-2b13d9fc4c27"],
        "reviews": [("Beatriz Casada", 5, "Santa Teresa é mágica! Casa linda e acolhedora.")],
    },
    {
        "title": "Flat em Barra da Tijuca",
        "description": "Flat de alto padrão na Barra com piscina, sauna e academia. A 5 min da praia e do shopping.",
        "address": "Av. das Américas, 5000", "city": "Rio de Janeiro", "state": "RJ",
        "lat": "-23.000800", "lng": "-43.365200", "price": "410.00", "guests": 4,
        "amenities": ["Wi-Fi", "Piscina", "Academia", "Ar-condicionado", "TV", "Estacionamento", "Vista para o mar"],
        "photos": ["1520250497591-112f2f40a3f4", "1507525428034-b723cf961d3e", "1449158743715-0a90ebb6d2d8", "1560448204-e02f11c3d0e2"],
        "reviews": [],
    },
    {
        "title": "Casa em Laranjeiras com quintal",
        "description": "Casa inteira em Laranjeiras com quintal, churrasqueira e 3 quartos. Bairro residencial e seguro.",
        "address": "Rua das Laranjeiras, 320", "city": "Rio de Janeiro", "state": "RJ",
        "lat": "-22.933400", "lng": "-43.178900", "price": "450.00", "guests": 6,
        "amenities": ["Wi-Fi", "Churrasqueira", "Cozinha equipada", "TV", "Estacionamento", "Pet friendly", "Varanda"],
        "photos": ["1512917774080-9991f1c4c750", "1505843513577-22bb7d21e455", "1499793983690-e29da59ef1c2", "1523217582562-09d8375d4a40"],
        "reviews": [("Roberto Família", 5, "Casa espaçosa, perfeita para grupo. Quintal ótimo!")],
    },
    # ── Campinas ──────────────────────────────────────────────────────────
    {
        "title": "Apartamento no Cambuí",
        "description": "Apartamento moderno no Cambuí, região nobre de Campinas. Perto de bares, restaurantes e do Parque Portugal.",
        "address": "Rua Coronel Quirino, 800", "city": "Campinas", "state": "SP",
        "lat": "-22.906400", "lng": "-47.061600", "price": "195.00", "guests": 3,
        "amenities": ["Wi-Fi", "Ar-condicionado", "TV", "Cozinha equipada", "Estacionamento"],
        "photos": ["1484154218962-a197022b5858", "1486304873000-235643847519", "1493663284031-b7e3aefcae8e", "1560185127-6ed189168fc1"],
        "reviews": [("Carlos Executivo", 5, "Ótimo para viagem de negócios em Campinas.")],
    },
    {
        "title": "Casa com piscina em Valinhos",
        "description": "Casa ampla em Valinhos com piscina aquecida e área gourmet. A 15 min do centro de Campinas.",
        "address": "Rua Antonio Carlos, 150", "city": "Campinas", "state": "SP",
        "lat": "-22.948500", "lng": "-46.997800", "price": "420.00", "guests": 8,
        "amenities": ["Wi-Fi", "Piscina", "Churrasqueira", "Cozinha equipada", "TV", "Estacionamento", "Pet friendly"],
        "photos": ["1499793983690-e29da59ef1c2", "1512917774080-9991f1c4c750", "1505843513577-22bb7d21e455", "1523217582562-09d8375d4a40"],
        "reviews": [],
    },
    {
        "title": "Studio perto da Unicamp",
        "description": "Studio funcional próximo à Unicamp e ao centro de Barão Geraldo. Ideal para congressos e visitas à universidade.",
        "address": "Av. Albino José Barbosa de Oliveira, 500", "city": "Campinas", "state": "SP",
        "lat": "-22.818900", "lng": "-47.070800", "price": "140.00", "guests": 2,
        "amenities": ["Wi-Fi", "Ar-condicionado", "TV", "Cozinha equipada"],
        "photos": ["1554995207-c18c203602cb", "1556020685-ae41abfc9365", "1536376072261-38c75010e6c9", "1502672260266-1c1ef2d93688"],
        "reviews": [("Hugo Hóspede", 4, "Bom custo-benefício perto da Unicamp.")],
    },
    {
        "title": "Loft industrial no Taquaral",
        "description": "Loft com estilo industrial no Taquaral, a 5 min do Lago do Taquaral. Espaço aberto e decoração contemporânea.",
        "address": "Av. Nossa Sra. de Fátima, 1200", "city": "Campinas", "state": "SP",
        "lat": "-22.897800", "lng": "-47.045600", "price": "210.00", "guests": 3,
        "amenities": ["Wi-Fi", "Ar-condicionado", "TV", "Cozinha equipada", "Máquina de lavar"],
        "photos": ["1595526051689-a04a69fd99ab", "1554995207-c18c203602cb", "1556020685-ae41abfc9365", "1522708323590-d24dbb6b0267"],
        "reviews": [],
    },
    # ── Curitiba (mais) ───────────────────────────────────────────────────
    {
        "title": "Studio no Centro Cívico",
        "description": "Studio no Centro Cívico de Curitiba, perto do Museu Oscar Niemeyer e do Parque Barigui.",
        "address": "Rua Cândido de Abreu, 200", "city": "Curitiba", "state": "PR",
        "lat": "-25.419500", "lng": "-49.264600", "price": "165.00", "guests": 2,
        "amenities": ["Wi-Fi", "Ar-condicionado", "TV", "Cozinha equipada"],
        "photos": ["1484154218962-a197022b5858", "1493663284031-b7e3aefcae8e", "1560185127-6ed189168fc1", "1486304873000-235643847519"],
        "reviews": [("Fernanda Turista", 5, "Curitiba é encantadora! Studio bem localizado.")],
    },
    {
        "title": "Casa em Colombo com vista da serra",
        "description": "Casa aconchegante em Colombo com vista para a Serra do Mar. Lareira, jardim e trilhas próximas.",
        "address": "Estrada da Ribeira, km 5", "city": "Curitiba", "state": "PR",
        "lat": "-25.291600", "lng": "-49.224100", "price": "290.00", "guests": 5,
        "amenities": ["Wi-Fi", "Lareira", "Churrasqueira", "Cozinha equipada", "Varanda", "Estacionamento", "Pet friendly"],
        "photos": ["1542718610-a1d656d1884c", "1449158743715-0a90ebb6d2d8", "1518780664697-55e3ad937233", "1586105251261-72a756497a11"],
        "reviews": [],
    },
    {
        "title": "Apartamento no Água Verde",
        "description": "Apartamento reformado no Água Verde, bairro arborizado com ótima gastronomia. Perto do Shopping Palladium.",
        "address": "Rua Brigadeiro Franco, 1800", "city": "Curitiba", "state": "PR",
        "lat": "-25.455100", "lng": "-49.287300", "price": "200.00", "guests": 4,
        "amenities": ["Wi-Fi", "Ar-condicionado", "TV", "Cozinha equipada", "Máquina de lavar", "Estacionamento"],
        "photos": ["1560185007-c18c203602cb", "1484154218962-a197022b5858", "1493663284031-b7e3aefcae8e", "1560185127-6ed189168fc1"],
        "reviews": [("Lucas Viajante", 5, "Bairro lindo e apartamento impecável.")],
    },
    # ── Belo Horizonte (mais) ─────────────────────────────────────────────
    {
        "title": "Apartamento na Pampulha",
        "description": "Apartamento com vista para a Lagoa da Pampulha e a Igreja São Francisco. A 10 min do Mineirão.",
        "address": "Av. Otacílio Negrão de Lima, 3000", "city": "Belo Horizonte", "state": "MG",
        "lat": "-19.851200", "lng": "-43.972800", "price": "220.00", "guests": 4,
        "amenities": ["Wi-Fi", "Ar-condicionado", "TV", "Cozinha equipada", "Varanda", "Estacionamento"],
        "photos": ["1502672260266-1c1ef2d93688", "1522708323590-d24dbb6b0267", "1560448204-e02f11c3d0e2", "1556909114-f6e7ad7d3136"],
        "reviews": [],
    },
    {
        "title": "Casa em Ouro Preto (região metropolitana)",
        "description": "Casa colonial restaurada com pátio de pedra e vista para as montanhas. Experiência histórica única.",
        "address": "Rua Direita, 80", "city": "Belo Horizonte", "state": "MG",
        "lat": "-19.937800", "lng": "-43.938100", "price": "310.00", "guests": 4,
        "amenities": ["Wi-Fi", "Cozinha equipada", "Varanda", "Lareira", "Café da manhã incluso"],
        "photos": ["1564013799919-ab600027ffc6", "1513584684374-8bab748fbf90", "1505691938895-1758d7feb511", "1534430480872-2b13d9fc4c27"],
        "reviews": [("Beatriz Casada", 5, "Experiência inesquecível! Casa linda e cheia de história.")],
    },
    # ── Florianópolis (mais) ──────────────────────────────────────────────
    {
        "title": "Apartamento em Jurerê Internacional",
        "description": "Apartamento de luxo em Jurerê Internacional, a 100m da praia. Condomínio com piscina e segurança 24h.",
        "address": "Rua das Algas, 300", "city": "Florianópolis", "state": "SC",
        "lat": "-27.424500", "lng": "-48.495800", "price": "520.00", "guests": 4,
        "amenities": ["Wi-Fi", "Piscina", "Ar-condicionado", "Vista para o mar", "TV", "Estacionamento", "Academia"],
        "photos": ["1507525428034-b723cf961d3e", "1520250497591-112f2f40a3f4", "1571896349842-33c89424de2d", "1582719478250-c89cae4dc85b"],
        "reviews": [("Marina Mochileira", 5, "Jurerê é espetacular! Apartamento de primeira.")],
    },
    {
        "title": "Chalé na Lagoa da Conceição",
        "description": "Chalé rústico na Lagoa da Conceição com deck sobre a água. Kitesurf e stand-up paddle na porta.",
        "address": "Rod. Francisco Magno Vieira, km 22", "city": "Florianópolis", "state": "SC",
        "lat": "-27.596700", "lng": "-48.461200", "price": "380.00", "guests": 4,
        "amenities": ["Wi-Fi", "Varanda", "Cozinha equipada", "Churrasqueira", "Pet friendly", "Vista para o mar"],
        "photos": ["1512917774080-9991f1c4c750", "1505843513577-22bb7d21e455", "1499793983690-e29da59ef1c2", "1523217582562-09d8375d4a40"],
        "reviews": [],
    },
]

GUEST_NAMES = [
    ("Hugo Hóspede", "hospede@demo.com"),
    ("Marina Mochileira", "hospede2@demo.com"),
    ("Lucas Viajante", "hospede3@demo.com"),
    ("Fernanda Turista", "hospede4@demo.com"),
    ("Beatriz Casada", "hospede5@demo.com"),
    ("Roberto Família", "hospede6@demo.com"),
    ("Carlos Executivo", "hospede7@demo.com"),
]


class Command(BaseCommand):
    help = "Popula o banco com dados de demonstração."

    def add_arguments(self, parser):
        parser.add_argument(
            "--append",
            action="store_true",
            help="Adiciona imóveis que ainda não existem (por título), sem apagar dados.",
        )

    def handle(self, *args, **options):
        append = options["append"]
        if Property.objects.exists() and not append:
            self.stdout.write(self.style.WARNING(
                "Banco já populado — use --append para adicionar novos imóveis."
            ))
            return

        if append and not Property.objects.exists():
            self.stdout.write(self.style.WARNING(
                "Banco vazio — rodando seed completo."
            ))

        # Comodidades
        amenity_map = {}
        for name, icon in AMENITIES:
            obj, _ = Amenity.objects.get_or_create(name=name, defaults={"icon": icon})
            amenity_map[name] = obj

        # Anfitriões
        host1, _ = User.objects.get_or_create(
            email="anfitriao@demo.com",
            defaults={"name": "Ana Anfitriã", "role": "host"},
        )
        if not host1.has_usable_password():
            host1.set_password("senha@123")
            host1.save()
        host2, _ = User.objects.get_or_create(
            email="anfitriao2@demo.com",
            defaults={"name": "Carlos Casas", "role": "host"},
        )
        if not host2.has_usable_password():
            host2.set_password("senha@123")
            host2.save()
        hosts = [host1, host2]

        # Hóspedes demo
        guests_objs = []
        for name, email in GUEST_NAMES:
            guest, created = User.objects.get_or_create(
                email=email,
                defaults={"name": name, "role": "guest"},
            )
            if created or not guest.has_usable_password():
                guest.set_password("senha@123")
                guest.save()
            guests_objs.append(guest)
        guest1, guest2 = guests_objs[0], guests_objs[1]

        # Imóveis
        today = date.today()
        props = []
        offset = 30
        created_count = 0

        for i, data in enumerate(PROPERTIES):
            if Property.objects.filter(title=data["title"]).exists():
                continue
            prop = Property.objects.create(
                host=hosts[i % 2],
                title=data["title"],
                description=data["description"],
                address=data["address"],
                city=data["city"],
                state=data["state"],
                latitude=Decimal(data["lat"]),
                longitude=Decimal(data["lng"]),
                price_per_night=Decimal(data["price"]),
                max_guests=data["guests"],
            )
            prop.amenities.set([amenity_map[a] for a in data["amenities"]])
            Photo.objects.bulk_create([
                Photo(property=prop, url=f"https://images.unsplash.com/photo-{pid}?w=900&q=80", order=j)
                for j, pid in enumerate(data["photos"])
            ])
            props.append(prop)
            created_count += 1

            # Avaliações inline do seed
            for guest_name, rating, comment in data.get("reviews", []):
                guest_obj = next((g for g in guests_objs if g.name == guest_name), guest1)
                check_in = today - timedelta(days=offset)
                check_out = check_in + timedelta(days=3)
                booking = Booking.objects.create(
                    property=prop, guest=guest_obj,
                    check_in=check_in, check_out=check_out, guests=2,
                    total_price=3 * prop.price_per_night,
                    status=Booking.Status.APPROVED,
                    card_holder=guest_obj.name.upper(), card_last4="1111", card_brand="Visa",
                )
                Review.objects.create(
                    booking=booking, property=prop, author=guest_obj,
                    rating=rating, comment=comment,
                )
                offset += 5

        # Reservas futuras de exemplo (apenas no seed completo)
        if not append and len(props) >= 2:
            Booking.objects.create(
                property=props[0], guest=guest2,
                check_in=today + timedelta(days=10),
                check_out=today + timedelta(days=14),
                guests=4, total_price=4 * props[0].price_per_night,
                status=Booking.Status.APPROVED,
                card_holder="MARINA MOCHILEIRA", card_last4="4444", card_brand="Mastercard",
            )
            Booking.objects.create(
                property=props[1], guest=guest1,
                check_in=today + timedelta(days=20),
                check_out=today + timedelta(days=23),
                guests=2, total_price=3 * props[1].price_per_night,
                status=Booking.Status.PENDING,
                card_holder="HUGO HOSPEDE", card_last4="1111", card_brand="Visa",
            )

        self.stdout.write(self.style.SUCCESS(
            f"Seed concluído: +{created_count} imóveis novos · "
            f"{Property.objects.count()} imóveis no total · "
            f"{Booking.objects.count()} reservas · {Review.objects.count()} avaliações."
        ))
        self.stdout.write("Senha universal: senha@123")
        self.stdout.write("  Anfitriões: anfitriao@demo.com / anfitriao2@demo.com")
        self.stdout.write("  Hóspedes:   hospede@demo.com … hospede7@demo.com")
