# F — data/today/*.yaml source check (69 items, 10 files)

General notes
- Theoi pages use bracketed section markers, not true line numbers; cited ranges below were checked against those markers and are treated as OK when the passage falls inside or near the range.
- All four Wikimedia Commons file pages returned `url_not_found` via WebFetch (tried twice each). I used the cached metadata in `data/commons/meta.json` as a fallback where it helps; it is NOT the same as opening the page.
- etymonline `bacchanal` failed twice (client_error). `dictionary.apa.org/oedipus-complex` returns only the site shell (JS-rendered); WebSearch did not surface the entry.
- Items whose pop-culture / brand claim rests only on a （輔助） Wikipedia page are flagged `[WIKI-ONLY]` inside an UNSUPPORTED or STYLE bullet.

---

## art.yaml

### birth-of-venus
- [UNREACHABLE] art.yaml sources[0] Commons page — WebFetch url_not_found x2. meta.json gives author Botticelli, date 1485, but nothing on 烏菲茲. Uffizi location is true but unverified from opened sources.
- [UNSUPPORTED] diff「荷馬則說她是宙斯的女兒」— no Homer source cited (it is Iliad 5.370ff, Aphrodite daughter of Zeus and Dione). Add 荷馬《伊里亞德》5.370–371 (theoi HomerIliad5).
- [LINE] diff 赫西俄德《神譜》188–206 — theoi markers put castration/foam/Kythera/Cyprus under [176]–[207]; "a white foam spread around them… in it there grew a maiden". Range 176–206 is safer.
checked: 4 claims, 1 source opened (+1 unreachable)

### apollo-daphne-statue
- [WRONG] diff「雕像幾乎逐句照著奧維德的描寫：手指長出樹葉」— Ovid 1.[548]ff: "her hair became as moving leaves; her arms were changed to waving branches; her feet… roots", "a thin bark closed around her gentle bosom". Fingers are not in Ovid (the sculpture shows leaves sprouting from her fingers). Fix: 「頭髮變成樹葉、手臂變成樹枝、腳變成樹根、樹皮包住胸口」，或改說「雕像把奧維德的頭髮與手臂化成枝葉，表現在指尖上」.
- [UNREACHABLE] Commons page (url_not_found x2); 博爾蓋塞美術館 not verified from an opened source (meta.json has no museum).
- Note: Daphne episode on theoi runs [452]–[553]; 1.452–567 OK.
checked: 4 claims, 1 source opened (+1 unreachable)

### laocoon-statue
- [UNREACHABLE] Commons page (url_not_found x2). The core `what` facts (梵蒂岡, 1506 年出土, 影響米開朗基羅) and the dating dispute in `diff` are therefore not supported by any opened source; meta.json only has photographer metadata. Facts are well known and true, but status 已查證 rests on an unopened page — add a museum/scholarly source (e.g. Musei Vaticani page) or treat as unverified.
- Aeneid 2 (MIT) confirms serpents kill Laocoön and two sons, and his warning.
checked: 5 claims, 1 source opened (+1 unreachable)

### icarus-landscape
- [UNREACHABLE] Commons page (url_not_found x2). meta.json (from the same Commons record) gives author "After Pieter Brueghel the Elder", date "1582–1625", supporting the 摹本 point; status 說法未證實 is appropriate.
- [UNSUPPORTED] what「詩人奧登的名詩〈美術館〉就是寫這幅畫」— not in any opened source (true: "Musée des Beaux Arts", 1938). Add a source.
- Ovid 8.[183]–[235] OK (fall at [220]; ploughman/shepherd/fisherman at [200]).
checked: 4 claims, 1 source opened (+1 unreachable)

---

## brands.yaml

### nike-brand
- [UNSUPPORTED] what「Nike 的名字取自希臘勝利女神」— [WIKI-ONLY] only the （輔助） Wikipedia page supports it ("The company takes its name from Nike, the Greek goddess of victory"). True, but the brand half of the item has no primary/official source.
- Hesiod [383]–[403] OK: Styx bore Zelus, Nike, Cratos, Bia; "came first to Olympus with her children"; "dwell always with Zeus". Wikipedia says nothing on the swoosh meaning, consistent with the text's hedge.
checked: 4 claims, 2 sources opened

### hermes-brand
- [UNSUPPORTED] diff (1837, Thierry Hermès, 馬具) — [WIKI-ONLY]. The central claim of the item is supported only by （輔助） Wikipedia ("founded in 1837 by Thierry Hermès… saddlery and harness"). Theoi Hermes says nothing about the brand. Status 已查證 is weak; add Hermès official history page.
checked: 3 claims, 2 sources opened

### versace-medusa
- [UNREACHABLE] Adweek article is paywalled; visible part has only the subtitle "Inspired by an ancient ruin, Medusa's head is among the strangest marks in fashion." The 「無法移開目光」 reading could not be seen. Status 說法未證實 is appropriate.
- Ovid 4.[787]: Neptune ("Sovereign of the Sea") in Minerva's temple, hair turned to serpents; [765] stoning and beheading. OK.
checked: 4 claims, 2 sources opened (1 partially)

### starbucks-siren
- [UNSUPPORTED] what「官方說，設計靈感來自一張十六世紀北歐木刻版畫中的雙尾海妖」— the official page now says only that Terry Heckler "scoured old marine books until an illustration caught his eye"; it calls her a "twin-tailed" siren but has no 16th-century / Norse woodcut. Fix: 「官方說，設計師翻閱古老的航海書籍時看到一幅雙尾海妖插圖」, or cite another source for the woodcut.
- [UNSUPPORTED] diff「《奧德賽》和古希臘陶瓶上的海妖賽蓮是『女人頭、鳥身體』」— Odyssey 12 never describes their body (only song, meadow, "heap of bones"). Fix: 「《奧德賽》只寫她們的歌聲，沒寫外形；古希臘陶瓶上的賽蓮多畫成女人頭、鳥身體」 and add a vase/art source.
checked: 5 claims, 2 sources opened

### amazon-brand
- [STYLE] diff「十六世紀西班牙探險家在河邊遇到女戰士，就用了這個神話名稱」— Etymonline: renamed by Orellana 1541 "after an encounter with female warriors of the Tapuyas", but notes some say they were "long-haired male tribesmen" and others derive the name from a Tupi/Guarani word for "wave". Soften: 「一般說法是…」.
- Business Insider (largest river, Cadabra) and Apollodorus 2.5.9 (Hippolyte's belt) OK.
checked: 5 claims, 3 sources opened

### ajax-name
- [UNSUPPORTED] what「清潔劑品牌 Ajax 取自大埃阿斯，形象是強壯可靠」— no source mentions the cleaner; [WIKI-ONLY] for the club ("named after the legendary Greek hero", which Ajax not specified).
- [STYLE] diff「羞憤發狂」— Apollodorus E 5.6: "Athena drove him mad". Better: 「被雅典娜弄得發狂」.
- Apollodorus E 5.6–5.7 otherwise OK (Ulysses preferred; killed himself).
checked: 4 claims, 2 sources opened

---

## extra.yaml

### bacchanal-word
- [UNREACHABLE] Etymonline「bacchanal」— client_error twice.
- World History Encyclopedia supports the 186 BCE ban (timeline: "The Roman Senate bans the Cult of Bacchus") and "religious rites, the Mysteries". OK.
checked: 3 claims, 1 source opened (+1 unreachable)

### vesta-asteroid
- [UNSUPPORTED] what「小行星帶中最亮的小行星」and diff「肉眼有時就看得到」— NASA page says neither (it says "second most massive body in the main asteroid belt"). True per other NASA material; add a source or drop.
- Dawn orbit mid-July 2011 to early Sept 2012 OK; Gauss named it for Roman hearth goddess OK; WHE Vesta = Hestia OK.
checked: 5 claims, 2 sources opened

### july
- Etymonline: named for Julius Caesar OK. Aeneid 1: Ascanius "Now call'd Iulus", "Caesar from the Julian stock shall rise", Aeneas son of Venus. OK.
checked: 3 claims, 2 sources opened

### argonaut-astronaut
- [UNSUPPORTED/likely WRONG] what「astronaut 是仿照 Argonaut 造出來的字」— Etymonline gives astro- + Greek nautēs "sailor", and says French astronautique (1927) was formed "on model of aéronautique". No mention of Argonaut. Fix: 「astronaut 由希臘文『星星』加『水手』組成，字面就是『星星的水手』；和 Argonaut 共用 -naut 字尾」, drop 仿照. Status as written should be 說法未證實.
- Apollodorus 1.9.16 OK (Argo, crew list).
checked: 3 claims, 2 sources opened

### hadestown
- [UNSUPPORTED] what「像經濟大蕭條時代的世界」and diff「黑帝斯是經營地底工廠的老闆，冥界像是礦坑」— official site mentions neither (only Tony "Best Musical", the two couples, "journey to the underworld"). True of the show; needs a review/press source.
- Ovid 10.[40] look-back OK.
checked: 5 claims, 2 sources opened

### perseids
- NASA: mid-August peak, radiant in Perseus, comet 109P/Swift-Tuttle OK. Apollodorus 2.4.3 Cassiepea boasting OK.
checked: 4 claims, 2 sources opened

### ship-of-theseus
- [UNSUPPORTED] diff「這個問題最早的紀錄來自普魯塔克」— Plutarch 23.1 describes the ship kept "down to the time of Demetrius Phalereus" with planks replaced and philosophers' debate, but does not say it is the earliest record. Soften: 「最有名的古代紀錄」.
checked: 3 claims, 1 source opened

### labyrinth-word
- Etymonline: "unknown origin"; labrys link "speculative" (Beekes); "built by Daedelus to hold the Minotaur". Ovid 8.[152] OK. Status 說法未證實 fine.
checked: 3 claims, 2 sources opened

### gaia-mission
- [UNSUPPORTED] diff「名字原本是一串英文縮寫…後來縮寫不再準確」— ESA page says nothing on the name. True (Global Astrometric Interferometer for Astrophysics); cite the ESA Gaia FAQ. ESA page says "two billion stars and other objects", consistent with >十億. Hesiod 116–133 OK.
- [STYLE] ESA says observations ran 2014–2025; the mission has ended, consider past tense.
checked: 4 claims, 2 sources opened

---

## literature.yaml

### joyce-ulysses
- [STYLE] diff「章節和《奧德賽》的段落一一對應」— Wikipedia: episodes "roughly correspond". Fix: 「大致對應」. Gutenberg page confirms title/author only; the 1922 / 16 June 1904 / structure facts are [WIKI-ONLY].
checked: 4 claims, 2 sources opened

### harry-potter-names
- [UNSUPPORTED] what Minerva (McGonagall) and Fluffy — [WIKI-ONLY] and the only Wikipedia page is "Remus Lupin", which covers Lupin only.
- [STYLE] what「冥界的三頭犬」with Hesiod cited — Hesiod [767] hound is not three-headed and unnamed; at [306] Cerberus is "fifty-headed". If citing Hesiod, don't imply he says three heads; cite Apollodorus 2.5.12 for three heads.
checked: 4 claims, 2 sources opened

### madeline-miller
- [UNSUPPORTED] what「美國作家」「從帕特羅克洛斯的角度」— official site states neither (focuses on Patroclus, doesn't name narrator or nationality). Both true; minor.
- Odyssey 10 Circe OK.
checked: 4 claims, 2 sources opened

---

## science.yaml

### achilles-tendon
- Radiopaedia: "oldest written record… 1693… Philip Verheyen" OK. Diff on Homer has no Homer source, minor.
checked: 3 claims, 2 sources opened

### oedipus-complex
- [UNREACHABLE] APA dictionary page returns only the site shell; WebSearch did not surface the entry. Definition and 「今天心理學界也有很多爭議」 thus unverified from opened sources.
- Apollodorus 3.5.7: Oedipus leaves Corinth to avoid the oracle, kills Laius, marries Jocasta unknowingly. OK.
checked: 4 claims, 1 source opened (+1 unreachable)

### caduceus-confusion
- PMC4190767 ("Medical Symbols in Practice: Myths vs Reality"): rod of Asclepius is the true symbol; a US Army medical corps captain proposed the caduceus in 1902; Hermes patron of commerce and thieves. OK. Apollodorus 3.10.3 Asclepius son of Apollo OK (no serpent mentioned, but not claimed).
checked: 5 claims, 2 sources opened

### titanium-uranium
- [UNSUPPORTED/likely WRONG] diff「泰坦則是被選來形容這種金屬的強韌」— RSC gives only "derived from the Titans, the sons of the Earth goddess". Klaproth chose a mythological name by analogy with uranium, not for strength (the metal's strength was unknown in 1795). Fix: 「克拉普羅特仿照鈾用神話命名，選了大地之子泰坦」.
- [STYLE] what「克拉普羅特替兩種元素命名」OK, but titanium was first found by Gregor 1791 (RSC); fine as worded.
- Uranium 1789 after planet OK.
checked: 5 claims, 2 sources opened

### promethium
- RSC: 1945, Marinsky/Glendenin/Coryell, fission products; Grace Coryell "allegedly felt they were, like Prometheus, stealing fire from the gods". OK. 「被懲罰的風險」 not in RSC (minor; Coryell's own statement elsewhere).
checked: 4 claims, 2 sources opened

### arachnida
- [UNSUPPORTED] what「arachnophobia」— not on Etymonline arachnid page (trivial). Rest OK (Arachnida = Lamarck 1815; Ovid 6 transformation).
checked: 4 claims, 2 sources opened

### atlas-vertebra
- [UNSUPPORTED] what (atlas = first cervical vertebra) — Etymonline「atlas」has no anatomical sense at all ("vertebra", "neck", "head" do not appear). The central claim has no supporting source. Replace with an anatomy source (e.g. Radiopaedia "Atlas (C1)") .
- Hesiod [507]–[520]: "through hard constraint upholds the wide heaven… wise Zeus assigned" OK.
checked: 3 claims, 2 sources opened

---

## screen.yaml

### disney-hercules
- [STYLE] [WIKI-ONLY] for the film's plot (Wikipedia: son of Zeus and Hera, Hades villain) — acceptable for a film synopsis.
- [LINE] diff「毒袍之死」is Apollodorus 2.7.7, outside the cited 2.4.8–2.4.12. Add 2.7.7.
- Apollodorus 2.4.8 (Alcmena, Hera's serpents), 2.4.12 (madness, kills children) OK.
checked: 6 claims, 2 sources opened

### percy-jackson
- [STYLE] [WIKI-ONLY] for the series facts (Riordan, Poseidon + mortal Sally Jackson, 2010/2013 films, Disney+ 2023). Theoi Poseidon supports mortal heroic sons (Theseus via Aethra). OK otherwise.
checked: 4 claims, 2 sources opened

### god-of-war
- Hesiod [383]: "Cratos (Strength)… dwell always with Zeus" OK; Wikipedia: Kratos kills Zeus. OK.
checked: 4 claims, 2 sources opened

### hades-game
- [WRONG] diff「遊戲把他寫成黑帝斯的兒子，整個家庭關係是重新編排的」— the cited WHE Zagreus page itself says a fragment of Aeschylus' *Sisyphus* "makes Zagreus a son of Hades" (and *Egyptians* identifies him with Hades). Fix: 「多數說法是宙斯與波瑟芬妮之子，但埃斯庫羅斯的殘篇就有『黑帝斯之子』的說法；遊戲選了這條冷門線，再自己補上整個家庭」.
- [UNSUPPORTED] what「主角是冥王的兒子札格列歐斯」— Supergiant page doesn't name Zagreus (only "defy the god of the dead… out of the Underworld"). True; minor.
checked: 4 claims, 2 sources opened

### ac-odyssey
- [STYLE] [WIKI-ONLY] for the game (Wikipedia: Peloponnesian War 431–422 BC, Medusa etc.). Hesiod 270–283 Medusa OK.
checked: 4 claims, 2 sources opened

### saint-seiya
- [UNSUPPORTED] diff「八十八星座的戰士」— [WIKI-ONLY] and the Wikipedia page says Cloths are based on constellations but does not say 88. Other facts (Kurumada, Saori, Poseidon/Hades, Cosmo) OK from Wikipedia. Apollodorus 3.14.1 Athena vs Poseidon OK.
checked: 5 claims, 2 sources opened

### nolan-odyssey
- [STYLE] TheWrap supports Universal + July 17, 2026. The film has now been released (WebSearch: opened July 17, 2026; >US$1B box office). 「2026 年夏天上映」is fine, but diff「劇情取捨請以片商與實際影片為準」reads as pre-release; update.
checked: 3 claims, 1 source opened

---

## space.yaml

### planet-names
- [UNSUPPORTED] diff「唯一的例外是天王星…用希臘名」— NASA https://science.nasa.gov/uranus/ says nothing about naming. [LINK] https://science.nasa.gov/uranus/facts/ says "named for Uranus, the Greek god of the sky, as suggested by Johann Bode" (not "only", but supports the Greek name). Use that URL.
- Hesiod 133–210 (Cronos child of Heaven; castration) OK.
checked: 4 claims, 2 sources opened (+1 extra)

### pluto-name
- [UNSUPPORTED] diff「普魯托是…別名『普魯同』（富有者）」— WHE Pluto doesn't mention Plouton or "wealthy" (calls Hades his Greek counterpart). True; add Theoi Haides page.
- Smithsonian: Venetia Burney, 11, Oxford, 1930 OK.
checked: 4 claims, 2 sources opened

### jupiter-moons
- [UNSUPPORTED] diff「四個名字都是被宙斯看上、追求過的人，其中甘尼米德…被擄上天」— NASA page gives no mythology; Ovid 1 supports only Io ("ravished in that cloud"). Add Met 2 (Callisto, Europa) and 10.155–161 (Ganymede).
- NASA: Galileo 1610, four names OK.
checked: 4 claims, 2 sources opened

### mars-moons
- [WRONG] what「1877 年由美國天文學家霍爾發現並命名」— Hall discovered them (NASA), but the names were proposed by Henry Madan; Hall adopted them (en.wikipedia Henry_George_Madan: "Asaph chose the suggestion of Henry Madan"). Fix: 「霍爾發現，名字採用英國教師亨利．馬丹的提議」. NASA page does not mention names/meanings.
- Iliad 15.[119]: Ares "bade Terror and Rout yoke his horses" OK (no parentage there); Hesiod [933] "Panic and Fear" sons of Ares and Cytherea OK.
checked: 5 claims, 3 sources opened

### apollo-program
- [STYLE] diff「月亮女神是他的雙胞胎姊姊」— contradicts the item's own sentence and artemis-program (Artemis was linked to the moon only later; early moon goddess is Selene). Theoi Apollon does not say twin/elder. Fix: 「後來和月亮連在一起的，是他的雙胞胎姊姊阿提米絲」.
- Astronomy.com: Silverstein, "Apollo riding his chariot across the Sun", plus "It was just an attractive name" — 據說 hedge OK. Theoi: Apollo and Helios distinct in Homer OK.
checked: 4 claims, 2 sources opened

### artemis-program
- [UNSUPPORTED] diff「阿提米絲在後期神話中確實和月亮連在一起…最早主要是狩獵與荒野女神」— neither source (Space.com, Hesiod 918–920) supports it. True; cite Theoi Artemis.
- Space.com: May 13, 2019; "Apollo had a twin sister, Artemis… goddess of the moon" OK.
checked: 3 claims, 2 sources opened

### saturn-moons
- [UNSUPPORTED] what (Saturn's moons named for Titans) — NASA Titan page says nothing about naming. True (named by John Herschel 1847); cite NASA "Saturn Moons" overview. Hesiod 133–138 Titans list (incl. Iapetus, Rhea) OK.
checked: 4 claims, 2 sources opened

### orion-constellation
- [UNSUPPORTED] diff「也有人說是阿提米絲派蠍子殺了他。天蠍座和獵戶座…」— Apollodorus 1.4.3–1.4.5 has no scorpion. Its two death versions are: challenged Artemis "to a match at quoits", or shot "for offering violence to Opis", a Hyperborean maiden.
- [UNSUPPORTED] diff「想侵犯阿提米絲」— Apollodorus has violence to Opis, not Artemis. Fix: 「有人說他向阿提米絲挑戰擲鐵餅、也有人說他侵犯了她的侍女俄庇斯，被她射死；另有說法（許吉努斯、奧維德《歲時記》）是蠍子殺了他」 and add a source for the scorpion (e.g. Ovid Fasti 5.537–544, theoi OvidFasti5).
- With the only source not supporting half the diff, 已查證 is too strong until a scorpion source is added.
checked: 4 claims, 1 source opened

---

## taiwan.yaml

### olympics-not-olympus
- [UNSUPPORTED] diff「相隔好幾百公里」— neither source gives distance or distinguishes the two (IOC: Olympia in "north-western Peloponnese", Zeus festival; WHE Olympus: "highest mountain (2,918 m)" only). True (~300 km); add a map/geography source or keep as is.
checked: 4 claims, 2 sources opened

### aegis-ships
- [UNSUPPORTED] what 譯名（台灣「神盾」、大陸「宙斯盾」）— no source; Lockheed page has no Taiwan/translation info. Commonly known; low priority.
- [STYLE] diff「後來梅杜莎的頭被裝在上面」— in the cited Iliad 5.[733] passage the aegis already carries "the head of the dread monster, the Gorgon". Fix: 「《伊里亞德》裡神盾上已經有蛇髮女妖的頭」.
- Iliad: Athena puts on "the tunic of Zeus" and the aegis, "portent of Zeus that beareth the aegis" OK.
checked: 5 claims, 2 sources opened

### typhoon-typhon
- Etymonline: Greek typhōn "whirlwind", Arabic tufan, Cantonese tai fung — OK. Hesiod: hundred snake heads, Zeus conquers him, "from Typhoeus come boisterous winds" OK. Status 說法未證實 fine.
checked: 4 claims, 2 sources opened

---

## time.yaml

### january
- Etymonline (Janus "guardian god of portals, doors, and gates", beginnings) and Fasti 1.[89] ("Greece hath no divinity like thee") OK.
checked: 3 claims, 2 sources opened

### march
- [UNSUPPORTED] diff「正是春天可以出兵打仗的季節」and「馬爾斯比阿瑞斯受尊敬得多」— neither Etymonline nor Fasti 3.75–98 says so (Fasti ties March to Mars as father of Romulus and patron of arms; spring imagery is around 3.[229]). 「羅馬古曆一年從三月開始」 and Mars = Romulus' father OK.
checked: 4 claims, 2 sources opened

### june
- Etymonline: "probably a contraction of Iunonius". Fasti 6: Juno, Juventas (iuvenes), Concordia; poet doesn't decide. OK.
checked: 4 claims, 2 sources opened

### april-may
- [WRONG] what「五月來自荷米斯的母親邁亞」as the 常見說法 cited to Etymonline — Etymonline says "possibly from Maja, Maia, a Roman earth goddess (wife of Vulcan)", not Hermes' mother. (Ovid Fasti 5 does link it to Maia daughter of Atlas, but Fasti 5 isn't cited.) Fix: cite Fasti 5.1–110 for both Maia/Atlantis and maiores, or reword to 「羅馬的大地女神邁亞（後來常和荷米斯的母親混為一談）」.
- [UNSUPPORTED] diff「五月也可能來自 maiores」— not in Etymonline May; it's in Fasti 5 (uncited).
- [STYLE] diff「四月也可能來自 aperire」— Etymonline calls that a folk etymology; its serious alternative is Etruscan Apru < Aphrodite, or "the next (month)". Fasti 4.[63] / [85] does give both Venus and aperit. OK as hedged.
checked: 5 claims, 3 sources opened

### saturday
- Etymonline: "no Germanic substitution… Roman Saturn" OK (doesn't literally say "only", but consistent). WHE Saturn: Cronus, golden age, agriculture, Saturnalia role reversal OK.
checked: 4 claims, 2 sources opened

---

## words.yaml

### chaos-word
- OK: Etymonline "gaping void", disorder sense ~1600; Hesiod [116] "at the first Chaos came to be".
checked: 3 claims, 2 sources opened

### titanic-word
- OK: Etymonline 1709 "gigantic", ship 1912; Hesiod Titans bound in Tartarus ([713]–[720]).
checked: 4 claims, 2 sources opened

### atlas-book
- Etymonline: Atlas figure on frontispiece; "Mercator's 1585 work" (text says 1595; the title *Atlas* was 1595, OK). No Mauretanian king in source, as the text itself admits. Status 說法未證實 OK.
checked: 3 claims, 1 source opened

### panic-word
- OK: Etymonline "contagious, groundless fear in herds and crowds, or in people in lonely spots"; Hymn 19: Pan son of Hermes, goat-footed, reed pipes.
checked: 4 claims, 2 sources opened

### echo-word
- OK: Ovid 3.[359] Juno's curse; [370] "nothing remains except her bones and voice"; Etymonline nymph.
checked: 4 claims, 2 sources opened

### narcissism-word
- [STYLE] diff「他是被復仇女神懲罰才愛上倒影」— Ovid 3.[402]: "heard by Nemesis". 「復仇女神」 in Taiwan usage usually means the Erinyes/Furies. Fix: 「被報應女神涅墨西斯懲罰」.
- Etymonline: Näcke 1899 (from Ellis 1898) OK for 十九世紀末.
checked: 4 claims, 2 sources opened

### nemesis-word
- [UNSUPPORTED] diff「專門懲罰傲慢的人」— Etymonline gives "goddess of vengeance, personification of divine wrath", "just indignation"; no hubris. And it has no "archenemy" sense (closest: "anything by which it seems one must be defeated", 1930). True elsewhere; minor.
- Ovid 3.[402] Nemesis hears prayer OK.
checked: 4 claims, 2 sources opened

### tantalize-word
- OK: Odyssey 11.[582] water swallowed up, wind tosses fruit; no reason given; Etymonline "for an offense variously given".
checked: 4 claims, 2 sources opened

### herculean-word
- [STYLE] diff「十二項任務其實是為了替自己發瘋殺子贖罪」— Apollodorus 2.4.12: purified by Thespius first, then the Pythia orders 12 years' service and *ten* labours (two later disallowed). Not explicitly expiation. Soften: 「是在他發瘋殺子之後，神諭命他去完成的」.
- Etymonline: Latin Hercules, Greek Herakles OK.
checked: 3 claims, 2 sources opened

### odyssey-word
- OK: Etymonline 1889 figurative; Odyssey 1: "longing for his return and for his wife".
checked: 3 claims, 2 sources opened

### achilles-heel
- [UNSUPPORTED] diff「最早見於公元一世紀的羅馬詩人斯塔提烏斯」— none of the three sources names Statius (M-W gives the Styx story; WHE gives fire "or in some accounts, the River Styx", no source). True (Statius, *Achilleid* 1.133–134, 269–270); cite it.
- [WRONG-ish/STYLE] diff「更早的作者只說他被箭射中腳踝而死」with Apollodorus E 5.3 cited — Apollodorus' *Library* is 1st–2nd c. CE, not earlier than Statius. The ankle text is right ("shot with an arrow in the ankle by Alexander and Apollo"), but "更早" needs an earlier source (e.g. Proclus' summary of the *Aethiopis*, or archaic vase paintings). Fix: 「其他古代作者（如阿波羅多洛斯）只說他被箭射中腳踝而死」.
checked: 5 claims, 3 sources opened

### pandoras-box
- [STYLE] diff「伊拉斯謨翻譯成拉丁文時造成的」— Wikipedia: "usually attributed to… Erasmus who, in his Latin account of the story of Pandora, changed… pithos to pyxis". It was a retelling (Adagia), not a translation of Hesiod; and the attribution is "usually". Fix: 「一般認為是伊拉斯謨用拉丁文改寫這個故事時」. Works and Days [90]: "Only Hope remained… under the rim of the great jar" OK. Erasmus point is [WIKI-ONLY].
checked: 4 claims, 2 sources opened

### trojan-malware
- OK: NIST "appears to have a useful function, but also has a hidden and potentially malicious function"; Aeneid 2 Laocoön warning, Trojans haul in horse.
checked: 4 claims, 2 sources opened

### mentor-word
- [UNSUPPORTED] diff「1699 年…費奈隆的小說《忒勒馬科斯歷險記》」— Etymonline has no Fénelon; it dates the "wise adviser" sense to 1750, via "later popular romances". True; add a source for Fénelon.
- Odyssey 2.[267] "Athena drew near… in the likeness of Mentor" OK; [224] Mentor in charge of the house OK.
checked: 4 claims, 2 sources opened

### muse-words
- [STYLE] Etymonline museum: "temple or shrine of the Muses" (「殿堂」fine). Music: "(art) of the Muses" OK. Hesiod [53]–[75]: nine daughters of Mnemosyne, names OK; specific domains (歷史、天文) are not in Hesiod (later tradition), minor.
checked: 4 claims, 3 sources opened

### cereal-word
- OK: Etymonline "of Ceres"; breakfast sense 1899. Hymn to Demeter [301] famine OK.
checked: 3 claims, 2 sources opened

### volcano-word
- [UNSUPPORTED] what「義大利的火山島 Vulcano 也是同一個字」— neither Etymonline nor WHE mentions the island. True; minor.
- WHE Vulcan: "devastating fire… (volcanoes)", "among the most dreaded of all the gods" supports the contrast. OK.
checked: 4 claims, 2 sources opened

---

## Wikipedia-only items (central claim rests on （輔助） Wikipedia)
hermes-brand (whole central claim), nike-brand (brand name), ajax-name (club; cleaner unsourced), joyce-ulysses (book facts), harry-potter-names (Minerva/Fluffy not even on the cited page), disney-hercules, percy-jackson, ac-odyssey, saint-seiya (88 constellations not even on the page), pandoras-box (Erasmus point). For a film/game/book synopsis this is tolerable; for hermes-brand and ajax-name the 已查證 status leans entirely on Wikipedia.

## Status suggestions
- Should not be 已查證 as sourced now: orion-constellation (scorpion/Artemis claims not in its only source), argonaut-astronaut (central 仿照 Argonaut claim unsupported; source says astro+naut, on model of aéronautique), atlas-vertebra (central claim absent from its source), laocoon-statue (all `what` facts only on an unreachable page), hermes-brand (Wikipedia-only).
- Existing 說法未證實 items (icarus, versace, labyrinth, atlas-book, typhoon, june, april-may) are appropriate.

## Summary count by severity
- WRONG: 5 (apollo-daphne fingers; hades-game Zagreus parentage; mars-moons "named by Hall"; april-may Maia identification; achilles-heel "更早" WRONG-ish)
- UNSUPPORTED: 34 (2 of them likely WRONG: argonaut-astronaut, titanium reason)
- LINE: 2 (birth-of-venus 188→176; disney-hercules needs 2.7.7)
- LINK: 1 (planet-names, inside its UNSUPPORTED bullet: use https://science.nasa.gov/uranus/facts/)
- UNREACHABLE: 7 (4 Commons file pages, Adweek paywall, etymonline bacchanal, APA dictionary)
- STYLE: 17
- Items: 69 checked across 10 files.
