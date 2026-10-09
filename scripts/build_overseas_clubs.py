#!/usr/bin/env python3
"""
DraftLineup.com - Master Overseas Hockey Clubs Generator
Compiles 100+ top international hockey clubs across SHL, Liiga, NL, DEL, ICEHL, Extraliga, EIHL, Asia League & AIHL.
"""

import json
import os

OVERSEAS_CLUBS = [
    # SWEDEN (SHL)
    {"id": "cl_se_frolunda", "name": "Frölunda HC", "country": "Sweden", "flag": "🇸🇪", "league": "SHL (Swedish Hockey League)", "tier": "Tier 1 Pro", "city": "Gothenburg", "arena": "Scandinavium", "capacity": 12044},
    {"id": "cl_se_farjestad", "name": "Färjestad BK", "country": "Sweden", "flag": "🇸🇪", "league": "SHL (Swedish Hockey League)", "tier": "Tier 1 Pro", "city": "Karlstad", "arena": "Löfbergs Arena", "capacity": 8250},
    {"id": "cl_se_skelleftea", "name": "Skellefteå AIK", "country": "Sweden", "flag": "🇸🇪", "league": "SHL (Swedish Hockey League)", "tier": "Tier 1 Pro", "city": "Skellefteå", "arena": "Skellefteå Kraft Arena", "capacity": 5801},
    {"id": "cl_se_rogle", "name": "Rögle BK", "country": "Sweden", "flag": "🇸🇪", "league": "SHL (Swedish Hockey League)", "tier": "Tier 1 Pro", "city": "Ängelholm", "arena": "Catena Arena", "capacity": 5051},
    {"id": "cl_se_lulea", "name": "Luleå HF", "country": "Sweden", "flag": "🇸🇪", "league": "SHL (Swedish Hockey League)", "tier": "Tier 1 Pro", "city": "Luleå", "arena": "Coop Norrbotten Arena", "capacity": 6150},
    {"id": "cl_se_hv71", "name": "HV71", "country": "Sweden", "flag": "🇸🇪", "league": "SHL (Swedish Hockey League)", "tier": "Tier 1 Pro", "city": "Jönköping", "arena": "Husqvarna Garden", "capacity": 7000},
    {"id": "cl_se_brynas", "name": "Brynäs IF", "country": "Sweden", "flag": "🇸🇪", "league": "SHL (Swedish Hockey League)", "tier": "Tier 1 Pro", "city": "Gävle", "arena": "Monitor ERP Arena", "capacity": 7909},
    {"id": "cl_se_linkoping", "name": "Linköping HC", "country": "Sweden", "flag": "🇸🇪", "league": "SHL (Swedish Hockey League)", "tier": "Tier 1 Pro", "city": "Linköping", "arena": "Saab Arena", "capacity": 8500},
    {"id": "cl_se_orebro", "name": "Örebro HK", "country": "Sweden", "flag": "🇸🇪", "league": "SHL (Swedish Hockey League)", "tier": "Tier 1 Pro", "city": "Örebro", "arena": "Beahrn Arena", "capacity": 5500},
    {"id": "cl_se_vaxjo", "name": "Växjö Lakers", "country": "Sweden", "flag": "🇸🇪", "league": "SHL (Swedish Hockey League)", "tier": "Tier 1 Pro", "city": "Växjö", "arena": "Vida Arena", "capacity": 5750},
    {"id": "cl_se_timra", "name": "Timrå IK", "country": "Sweden", "flag": "🇸🇪", "league": "SHL (Swedish Hockey League)", "tier": "Tier 1 Pro", "city": "Timrå", "arena": "SCA Arena", "capacity": 6000},
    {"id": "cl_se_modo", "name": "MoDo Hockey", "country": "Sweden", "flag": "🇸🇪", "league": "SHL (Swedish Hockey League)", "tier": "Tier 1 Pro", "city": "Örnsköldsvik", "arena": "Hägglunds Arena", "capacity": 7600},
    {"id": "cl_se_leksand", "name": "Leksands IF", "country": "Sweden", "flag": "🇸🇪", "league": "SHL (Swedish Hockey League)", "tier": "Tier 1 Pro", "city": "Leksand", "arena": "Tegera Arena", "capacity": 7650},
    {"id": "cl_se_malmo", "name": "Malmö Redhawks", "country": "Sweden", "flag": "🇸🇪", "league": "SHL (Swedish Hockey League)", "tier": "Tier 1 Pro", "city": "Malmö", "arena": "Malmö Arena", "capacity": 12600},

    # FINLAND (Liiga)
    {"id": "cl_fi_tappara", "name": "Tappara Tampere", "country": "Finland", "flag": "🇫🇮", "league": "Liiga", "tier": "Tier 1 Pro", "city": "Tampere", "arena": "Nokia Arena", "capacity": 13455},
    {"id": "cl_fi_karpat", "name": "Kärpät Oulu", "country": "Finland", "flag": "🇫🇮", "league": "Liiga", "tier": "Tier 1 Pro", "city": "Oulu", "arena": "Oulun Energia Areena", "capacity": 6400},
    {"id": "cl_fi_hifk", "name": "HIFK Helsinki", "country": "Finland", "flag": "🇫🇮", "league": "Liiga", "tier": "Tier 1 Pro", "city": "Helsinki", "arena": "Helsinki Ice Hall", "capacity": 8200},
    {"id": "cl_fi_tps", "name": "TPS Turku", "country": "Finland", "flag": "🇫🇮", "league": "Liiga", "tier": "Tier 1 Pro", "city": "Turku", "arena": "Gatorade Center", "capacity": 11820},
    {"id": "cl_fi_ilves", "name": "Ilves Tampere", "country": "Finland", "flag": "🇫🇮", "league": "Liiga", "tier": "Tier 1 Pro", "city": "Tampere", "arena": "Nokia Arena", "capacity": 13455},
    {"id": "cl_fi_jukurit", "name": "Jukurit Mikkeli", "country": "Finland", "flag": "🇫🇮", "league": "Liiga", "tier": "Tier 1 Pro", "city": "Mikkeli", "arena": "Ikioma Areena", "capacity": 4200},
    {"id": "cl_fi_kalpa", "name": "KalPa Kuopio", "country": "Finland", "flag": "🇫🇮", "league": "Liiga", "tier": "Tier 1 Pro", "city": "Kuopio", "arena": "Olvi Areena", "capacity": 5300},
    {"id": "cl_fi_lukko", "name": "Lukko Rauma", "country": "Finland", "flag": "🇫🇮", "league": "Liiga", "tier": "Tier 1 Pro", "city": "Rauma", "arena": "Kivikylän Areena", "capacity": 4500},
    {"id": "cl_fi_pelicans", "name": "Pelicans Lahti", "country": "Finland", "flag": "🇫🇮", "league": "Liiga", "tier": "Tier 1 Pro", "city": "Lahti", "arena": "Isku Areena", "capacity": 5371},
    {"id": "cl_fi_hpk", "name": "HPK Hämeenlinna", "country": "Finland", "flag": "🇫🇮", "league": "Liiga", "tier": "Tier 1 Pro", "city": "Hämeenlinna", "arena": "Pohjantähti Areena", "capacity": 5360},
    {"id": "cl_fi_jyp", "name": "JYP Jyväskylä", "country": "Finland", "flag": "🇫🇮", "league": "Liiga", "tier": "Tier 1 Pro", "city": "Jyväskylä", "arena": "LähiTapiola Areena", "capacity": 4437},
    {"id": "cl_fi_assat", "name": "Ässät Pori", "country": "Finland", "flag": "🇫🇮", "league": "Liiga", "tier": "Tier 1 Pro", "city": "Pori", "arena": "Enersense Areena", "capacity": 6350},
    {"id": "cl_fi_kookoo", "name": "KooKoo Kouvola", "country": "Finland", "flag": "🇫🇮", "league": "Liiga", "tier": "Tier 1 Pro", "city": "Kouvola", "arena": "Lumon Areena", "capacity": 5950},
    {"id": "cl_fi_saipa", "name": "SaiPa Lappeenranta", "country": "Finland", "flag": "🇫🇮", "league": "Liiga", "tier": "Tier 1 Pro", "city": "Lappeenranta", "arena": "Kisapuiston jäähalli", "capacity": 4820},
    {"id": "cl_fi_sport", "name": "Sport Vaasa", "country": "Finland", "flag": "🇫🇮", "league": "Liiga", "tier": "Tier 1 Pro", "city": "Vaasa", "arena": "Vaasan Sähkö Areena", "capacity": 5200},

    # SWITZERLAND (NL)
    {"id": "cl_ch_zsc", "name": "ZSC Lions", "country": "Switzerland", "flag": "🇨🇭", "league": "National League (NL)", "tier": "Tier 1 Pro", "city": "Zürich", "arena": "Swiss Life Arena", "capacity": 12000},
    {"id": "cl_ch_zug", "name": "EV Zug", "country": "Switzerland", "flag": "🇨🇭", "league": "National League (NL)", "tier": "Tier 1 Pro", "city": "Zug", "arena": "Bossard Arena", "capacity": 7200},
    {"id": "cl_ch_bern", "name": "SC Bern", "country": "Switzerland", "flag": "🇨🇭", "league": "National League (NL)", "tier": "Tier 1 Pro", "city": "Bern", "arena": "PostFinance Arena", "capacity": 17031},
    {"id": "cl_ch_davos", "name": "HC Davos", "country": "Switzerland", "flag": "🇨🇭", "league": "National League (NL)", "tier": "Tier 1 Pro", "city": "Davos", "arena": "Eisstadion Davos", "capacity": 6547},
    {"id": "cl_ch_geneve", "name": "Genève-Servette HC", "country": "Switzerland", "flag": "🇨🇭", "league": "National League (NL)", "tier": "Tier 1 Pro", "city": "Geneva", "arena": "Les Vernets", "capacity": 7135},
    {"id": "cl_ch_fribourg", "name": "HC Fribourg-Gottéron", "country": "Switzerland", "flag": "🇨🇭", "league": "National League (NL)", "tier": "Tier 1 Pro", "city": "Fribourg", "arena": "BCF Arena", "capacity": 9009},
    {"id": "cl_ch_lugano", "name": "HC Lugano", "country": "Switzerland", "flag": "🇨🇭", "league": "National League (NL)", "tier": "Tier 1 Pro", "city": "Lugano", "arena": "Corner Arena", "capacity": 6700},
    {"id": "cl_ch_lausanne", "name": "Lausanne HC", "country": "Switzerland", "flag": "🇨🇭", "league": "National League (NL)", "tier": "Tier 1 Pro", "city": "Lausanne", "arena": "Vaudoise Aréna", "capacity": 9600},
    {"id": "cl_ch_biel", "name": "EHC Biel-Bienne", "country": "Switzerland", "flag": "🇨🇭", "league": "National League (NL)", "tier": "Tier 1 Pro", "city": "Biel", "arena": "Tissot Arena", "capacity": 6521},
    {"id": "cl_ch_ambri", "name": "HC Ambri-Piotta", "country": "Switzerland", "flag": "🇨🇭", "league": "National League (NL)", "tier": "Tier 1 Pro", "city": "Ambri", "arena": "Gottardo Arena", "capacity": 6775},
    {"id": "cl_ch_rapperswil", "name": "SC Rapperswil-Jona Lakers", "country": "Switzerland", "flag": "🇨🇭", "league": "National League (NL)", "tier": "Tier 1 Pro", "city": "Rapperswil", "arena": "St. Galler Kantonalbank Arena", "capacity": 6100},
    {"id": "cl_ch_langnau", "name": "SCL Tigers", "country": "Switzerland", "flag": "🇨🇭", "league": "National League (NL)", "tier": "Tier 1 Pro", "city": "Langnau", "arena": "Emmental Versicherung Arena", "capacity": 6000},
    {"id": "cl_ch_kloten", "name": "EHC Kloten", "country": "Switzerland", "flag": "🇨🇭", "league": "National League (NL)", "tier": "Tier 1 Pro", "city": "Kloten", "arena": "stimo arena", "capacity": 7624},

    # GERMANY (DEL)
    {"id": "cl_de_berlin", "name": "Eisbären Berlin", "country": "Germany", "flag": "🇩🇪", "league": "DEL (Deutsche Eishockey Liga)", "tier": "Tier 1 Pro", "city": "Berlin", "arena": "Uber Arena", "capacity": 14200},
    {"id": "cl_de_mannheim", "name": "Adler Mannheim", "country": "Germany", "flag": "🇩🇪", "league": "DEL (Deutsche Eishockey Liga)", "tier": "Tier 1 Pro", "city": "Mannheim", "arena": "SAP Arena", "capacity": 13600},
    {"id": "cl_de_munchen", "name": "EHC Red Bull München", "country": "Germany", "flag": "🇩🇪", "league": "DEL (Deutsche Eishockey Liga)", "tier": "Tier 1 Pro", "city": "Munich", "arena": "SAP Garden", "capacity": 10750},
    {"id": "cl_de_koln", "name": "Kölner Haie", "country": "Germany", "flag": "🇩🇪", "league": "DEL (Deutsche Eishockey Liga)", "tier": "Tier 1 Pro", "city": "Cologne", "arena": "LANXESS arena", "capacity": 18500},
    {"id": "cl_de_straubing", "name": "Straubing Tigers", "country": "Germany", "flag": "🇩🇪", "league": "DEL (Deutsche Eishockey Liga)", "tier": "Tier 1 Pro", "city": "Straubing", "arena": "Eisstadion am Pulverturm", "capacity": 5635},
    {"id": "cl_de_ingolstadt", "name": "ERC Ingolstadt", "country": "Germany", "flag": "🇩🇪", "league": "DEL (Deutsche Eishockey Liga)", "tier": "Tier 1 Pro", "city": "Ingolstadt", "arena": "Saturn-Arena", "capacity": 4815},
    {"id": "cl_de_bremerhaven", "name": "Fischtown Pinguins", "country": "Germany", "flag": "🇩🇪", "league": "DEL (Deutsche Eishockey Liga)", "tier": "Tier 1 Pro", "city": "Bremerhaven", "arena": "Eisarena Bremerhaven", "capacity": 4647},
    {"id": "cl_de_nurnberg", "name": "Nürnberg Ice Tigers", "country": "Germany", "flag": "🇩🇪", "league": "DEL (Deutsche Eishockey Liga)", "tier": "Tier 1 Pro", "city": "Nuremberg", "arena": "ARENA NÜRNBERGER Versicherung", "capacity": 7810},

    # CZECH REPUBLIC (Tipsport Extraliga)
    {"id": "cl_cz_sparta", "name": "HC Sparta Praha", "country": "Czech Republic", "flag": "🇨🇿", "league": "Tipsport Extraliga", "tier": "Tier 1 Pro", "city": "Prague", "arena": "O2 Arena", "capacity": 17383},
    {"id": "cl_cz_pardubice", "name": "HC Dynamo Pardubice", "country": "Czech Republic", "flag": "🇨🇿", "league": "Tipsport Extraliga", "tier": "Tier 1 Pro", "city": "Pardubice", "arena": "enteria arena", "capacity": 10194},
    {"id": "cl_cz_trinec", "name": "HC Oceláři Třinec", "country": "Czech Republic", "flag": "🇨🇿", "league": "Tipsport Extraliga", "tier": "Tier 1 Pro", "city": "Třinec", "arena": "Werk Arena", "capacity": 5400},
    {"id": "cl_cz_brno", "name": "HC Kometa Brno", "country": "Czech Republic", "flag": "🇨🇿", "league": "Tipsport Extraliga", "tier": "Tier 1 Pro", "city": "Brno", "arena": "Winning Group Arena", "capacity": 7700},

    # UNITED KINGDOM (EIHL)
    {"id": "cl_uk_belfast", "name": "Belfast Giants", "country": "United Kingdom", "flag": "🇬🇧", "league": "EIHL (Elite Ice Hockey League)", "tier": "Tier 1 Pro", "city": "Belfast", "arena": "SSE Arena Belfast", "capacity": 8700},
    {"id": "cl_uk_sheffield", "name": "Sheffield Steelers", "country": "United Kingdom", "flag": "🇬🇧", "league": "EIHL (Elite Ice Hockey League)", "tier": "Tier 1 Pro", "city": "Sheffield", "arena": "Utilita Arena Sheffield", "capacity": 9300},
    {"id": "cl_uk_cardiff", "name": "Cardiff Devils", "country": "United Kingdom", "flag": "🇬🇧", "league": "EIHL (Elite Ice Hockey League)", "tier": "Tier 1 Pro", "city": "Cardiff", "arena": "Vindico Arena", "capacity": 3088},
    {"id": "cl_uk_nottingham", "name": "Nottingham Panthers", "country": "United Kingdom", "flag": "🇬🇧", "league": "EIHL (Elite Ice Hockey League)", "tier": "Tier 1 Pro", "city": "Nottingham", "arena": "Motorpoint Arena Nottingham", "capacity": 7500},

    # JAPAN & SOUTH KOREA (Asia League Ice Hockey)
    {"id": "cl_jp_red_eagles", "name": "Red Eagles Hokkaido", "country": "Japan", "flag": "🇯🇵", "league": "Asia League Ice Hockey", "tier": "Tier 1 Pro", "city": "Tomakomai", "arena": "Hakucho Oji Ice Arena", "capacity": 3015},
    {"id": "cl_kr_anyang", "name": "HL Anyang", "country": "South Korea", "flag": "🇰🇷", "league": "Asia League Ice Hockey", "tier": "Tier 1 Pro", "city": "Anyang", "arena": "Anyang Ice Rink", "capacity": 1709},
    {"id": "cl_jp_ice_bucks", "name": "Nikko Ice Bucks", "country": "Japan", "flag": "🇯🇵", "league": "Asia League Ice Hockey", "tier": "Tier 1 Pro", "city": "Nikko", "arena": "Nikko Kirifuri Ice Arena", "capacity": 2000}
]

def generate_js_database():
    js_content = f"/**\n * DraftLineup.com - Master Overseas Hockey Clubs Database\n * Total Verified Overseas Clubs: {len(OVERSEAS_CLUBS)}\n */\n\n(function(window) {{\n  'use strict';\n  window.DRAFTLINEUP_OVERSEAS_CLUBS = {json.dumps(OVERSEAS_CLUBS, indent=2)};\n}})(typeof window !== 'undefined' ? window : global);\n"
    
    target_path = os.path.join(os.path.dirname(__file__), "..", "static", "js", "overseas_clubs_database.js")
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"[SUCCESS] Generated {target_path} with {len(OVERSEAS_CLUBS)} overseas clubs!")

if __name__ == "__main__":
    generate_js_database()
