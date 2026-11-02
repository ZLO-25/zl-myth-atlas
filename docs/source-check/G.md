# Checker G: places / history / odyssey-route / greek-roman / images

Access notes: commons.wikimedia.org could not be opened (WebFetch returned url_not_found twice, and the sandbox proxy refuses the host). For images I relied on the Commons API fields saved in `data/commons/meta.json` (author, date, description, credit), plus web searches for the two museum questions. Thayer (penelope.uchicago.edu), theoi.com, worldhistory.org, whc.unesco.org and classics.mit.edu all opened.

## data/places.yaml

All 12 coordinates are within ~1 km of the real site: Mytikas, Delphi sanctuary, Hisarlik, Mycenae, Knossos, Acropolis, Olympia, Eleusis, Vathy/Ithaca, Palatine, Avernus and Cape Matapan.

- [LINK] places.yaml `olympus` src `https://www.worldhistory.org/Mount_Olympus/`: the page that loads is a WHE search-results page, not an article. It has only a one-line entry ("the highest mountain (2,918 m) in Greece and home of the Olympian gods"). Use a real article instead, e.g. UNESCO/Britannica, or WHE's `https://www.worldhistory.org/Olympus/` if one exists.
- [UNSUPPORTED] places.yaml `rome` 「山丘上發現約前八世紀的聚落遺跡」: neither cited source says this. UNESCO 91 gives only "Founded, according to legend, by Romulus and Remus in 753 BC", with no Palatine and no remains. WHE "Rome" does not mention the Palatine or huts. The claim is true (the Iron Age "huts of Romulus" on the Palatine), but it needs a source such as the Parco archeologico del Colosseo page on the Palatine, or the clause should be cut.
- [UNSUPPORTED] places.yaml `ithaca` 「學者仍有爭論」: the cited source is Odyssey 9.19ff (theoi ¶[19], "I dwell in clear-seen Ithaca, wherein is a mountain, Neriton"). Homer is fine as the source for "Odysseus' home", but the scholarly debate needs its own source, e.g. a WHE or Britannica article on Ithaca or the Odysseus Unbound project.
- [UNSUPPORTED] places.yaml `troy` 「多數學者認為就是特洛伊」: UNESCO 849 confirms the layers and 1870 Schliemann excavation ("十九世紀起開挖" is OK). It only links the site to Homer and does not say most scholars accept the identification. WHE "Troy" does say it ("it is now almost universally accepted"), so add that source.
- [UNSUPPORTED] places.yaml `eleusis` 「古希臘最著名的秘儀」: WHE says "most famous for its annual festival of the Mysteries in honour of Demeter and Persephone". That is close enough on "famous", but WHE does not say "sanctuary" or "the most famous in Greece". Low priority.
- [UNSUPPORTED] places.yaml `taenarum` 「希臘本土最南端的海角」: Apollodorus 2.5.12 has only "Taenarum in Laconia, where is the mouth of the descent to Hades". The claim is true but sits outside the source. Low priority.

checked: 30 claims, 13 sources opened (WHE Olympus, Knossos, Eleusinian Mysteries, Rome; UNESCO 393, 849, 941, 404, 517, 91; Apollodorus 2; Aeneid 6 MIT; Odyssey 9)

## data/history.yaml

- [LINK] history.yaml `索福克勒斯《伊底帕斯王》` src `https://www.worldhistory.org/Oedipus_Rex/`: this is a search-results page, not an article. The only date shown is "Oedipus the King (429-420 BCE)".
- [STYLE] history.yaml note 「約在前 430 年代末」: start/end are −429, and 429 BCE falls in the 420s BCE, not the late 430s. Suggest 「年代為學者推估，一般認為約在前 429 年前後（也有學者推到前 420 年代）」.
- [STYLE] history.yaml `荷馬史詩成形` 「大約在這段時間寫定」: WHE Homer gives c. 800–700 BCE and says the poems were composed orally and "were not written down until much later". Suggest 「大約在這段時間成形（口傳為主，何時寫成文字仍有爭論）」.
- [UNSUPPORTED] history.yaml `赫西俄德寫《神譜》` 「最早有系統整理希臘眾神家譜的作品」: WHE calls the Theogony only "a unique account of the deities of Greece and their lineage". The claim is widely held, but it is not in this source. Suggest 「現存最早……」 plus a source, or soften it.
- [UNSUPPORTED] history.yaml `邁錫尼文明` start −1600: WHE gives "c. 1700-1100 BCE", with a peak "from the 15th to the 13th century BCE". −1600 is a common convention, but it differs from the cited page. Either change it to −1700 or keep it and accept the mismatch. Low priority.
- OK: Minoan palaces (WHE: Protopalatial from 2000/1900, palaces destroyed 1500–1450), Troy (WHE: VIIa c. 1300–1180), Rome 753, Parthenon 447–432, Aeneid (WHE "c. 30 – c. 19 BCE", "die before its completion"), Ovid (WHE "Completed prior to his exile", exile 8 CE).

checked: 20 claims, 10 sources opened

## data/odyssey-route.yaml

- [LINK] odyssey-route.yaml, all 5 Strabo rows that use `https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Strabo/1B*.html`: this URL does not exist (fetch fails). Thayer splits Book 1 chapter 2 into `1B1*.html` (1.2.1–23) and `1B2*.html` (1.2.24–40). Fix: `https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Strabo/1B1*.html`.
- [UNSUPPORTED] odyssey-route.yaml `喀耳刻的島` cite 史特拉波 1.2.12 「這座海角古名『喀耳刻之地』」: 1.2.12 is about the Sirens and Sirenussae. Book 1 names Circaeum only once, in 1.2.14, in a list of places Eratosthenes thought "wholly unknown". The supporting passage is **Strabo 5.3.6**: "Circaeum, a mountain which has the form of an island … It has a little city and a temple of Circe". Fix: cite 《地理學》5.3.6, url `https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Strabo/5C*.html`.
- [UNSUPPORTED] odyssey-route.yaml `斯庫拉與卡律布狄斯` note 「海峽的漩渦被想像成卡律布狄斯」: 1.2.9 places the pair in the Strait ("Charybdis and the Rock of Scylla were infested by brigands"), so the location is OK. The whirlpool explanation is not in 1.2.9; Strabo develops it later in Book 1 chapter 2 (1B2 page). Either cite 1.2.9 for the location only, or add the later section.
- [STYLE] odyssey-route.yaml `風神的浮島` 「史特拉波認為風神埃俄羅斯的島就是利帕里群島」: 1.2.9 has "history says that Aeolus was once king over the islands about Lipara". That supports the islands but is reported as tradition ("history says"), not as Strabo's own identification. Strabo 6.2.11 pins it to Strongyle (Stromboli): "this is where Aeolus lived, it is said". The point at Lipari town is acceptable; consider 「史特拉波記載，傳說埃俄羅斯統治利帕里一帶的島嶼」.
- OK, verified: Lotus-eaters, Strabo 17.3.17 at `17C*.html` ("Meninx is regarded as the land of the Lotus-eaters mentioned by Homer"; correct URL). Cyclopes, 1.2.9 ("region about Aetna and Leontine"). Sirens, 1.2.12–13 ("three uninhabited rocky little islands, called the Sirens", near Surrentum). Cicones, Od. 9.39–61 (Ismarus, sack, rout). Underworld, Od. 11.13ff (Oceanus, Cimmerians). Thrinacia, Od. 12.260 (arrival), 12.352 (cattle), 12.404ff (thunderbolt). Ogygia, Od. 7.244ff ("There is an isle, Ogygia"). Scheria, Thuc. 1.25 ("the Phaeacians", former inhabitants of Corcyra). All coordinates are plausible for their stated guess.

checked: 24 claims, 9 sources opened (Thayer Strabo index, 1B1, 5C, 6B, 17C; theoi Od. 7, 9, 11, 12; Perseus Thuc. 1.25)

## data/greek-roman.yaml

- [STYLE] greek-roman.yaml `Persephone` today 「音樂劇《冥王星城》」: Hadestown is named after Hades (冥王/冥府), not the dwarf planet Pluto (冥王星), so 「冥王星城」 is a mistranslation. The same title appears in data/today/extra.yaml:44 and cards/hero/hero-orpheus.md:13. Suggest 「音樂劇《冥府之城》（Hadestown）」, or the English title alone if there is no established Taiwan title (I did not confirm one).
- All Greek/Roman/Latin/English pairs are correct (Iuppiter, Iuno, Neptunus, Ceres, Minerva, Mars, Venus, Vulcanus, Mercurius, Vesta, Bacchus/Liber, Pluto/Dis Pater, Saturnus, Tellus/Terra, Proserpina, Hercules, Ulixes, Ianus). The today notes are also correct: Uranus is the only planet with a Greek-deity name; uranium; Vesta 灶神星; Ceres 穀神星; Aegis; Artemis program; March, Saturday, January. The June/Juno link is correctly marked 說法未證實. The file cites no sources by design.

checked: 22 rows, 0 sources opened (pairs checked from reference knowledge)

## data/images.yaml (97 `kind: work` entries)

- [WRONG] images.yaml `img-pandora-rossetti` museum 「英國利物浦利弗夫人美術館」: the Commons file is the 1871 oil, credited "Sotheby's, London, 22 May 2014, lot 207". Artlyst on that sale: commissioned by John Graham, later the Butler family, sold in 1966, "since been in a private collection". Fix: museum 「私人收藏」.
- [UNSUPPORTED] images.yaml `img-hephaestus-return` museum 「見圖片來源頁」: Commons gives the museum. Fix: 「希臘雅典基克拉澤斯藝術博物館（古蘭德里斯收藏，編號 1117）」 (source: "Athens, Museum for Cycladic and Archaic Art, N.P. Goulandris Collection, no. 1117").
- [WRONG] images.yaml `img-persephone-hydria` date 「約前 460–450 年」: Commons gives "(early) classical, ca. 450-440 BC" (Munich 2432). Fix: 「約前 450–440 年」.
- [UNSUPPORTED] images.yaml `img-uranus-vasari` date 「約 1560 年」: Commons gives only "16th century". The Sala degli Elementi ceiling in Palazzo Vecchio is usually dated c. 1555–1557 (from my own knowledge, not the file page). Suggest 「約 1555–1557 年」 or 「16 世紀中葉」.
- [UNSUPPORTED] images.yaml `img-pandora-krater` museum British Museum: the saved Commons description is cut off before the museum field, so the file page does not confirm it. Web search confirms Beazley 206955, ARV 601.23 = London, British Museum 1856,1213.1, so the museum is correct. No change needed.
- [UNSUPPORTED] images.yaml `img-cronus-stone` museum 「原浮雕在羅馬卡比托利歐博物館」: Commons says only "bas-relief d'un autel romain" (Millin 1811), with no location. This is probably right (the Capitoline altar of Saturn and Rhea) but unverified from the file page.
- [STYLE] images.yaml `img-dionysus-titian` look 「從豹拉的車上」: Commons/NG say "chariot drawn by two cheetahs". Suggest 「從兩頭獵豹拉的車上」.
- [STYLE] images.yaml `img-tellus-mosaic` look 「右下躺著的女神」: Commons says Tellus is "Sitting in front of him". Suggest 「右下坐著的女神」. Commons also says the four children "possibly" represent the seasons, so suggest 「可能代表四季」.
- [STYLE] images.yaml `img-ares-ludovisi` look 「腳邊原本有一個小愛神」: the small Eros is still at his feet (partly restored), so 「原本」 reads as if it were lost. Suggest 「腳邊有一個小愛神」.
- [STYLE] images.yaml `img-arachne-dore` date 「1861–1868」, museum 「但丁《神曲》插畫」: Commons says "1861 edition of Dante's Inferno". The museum field is not a museum; suggest 「書籍插畫（但丁《神曲》）」. Doré's Arachne plate is generally from Purgatorio XII (1868), which conflicts with the Commons description. Low priority.
- Note, no change needed: `img-artemis-titian` Commons date reads "from 1556 until 1569", but the yaml's 1556–1559 matches the National Gallery and National Galleries Scotland dating; the Commons metadata looks like a typo. `img-aphrodite-milo` Commons gives "ca. 130-100 BC?" against the yaml's 150–125 BC (the Louvre's range); both are acceptable.
- All other entries match Commons on artist, date and museum, including Watts (Tate), Goya, Rubens Saturn, Velázquez (Prado), Rubens Prometheus (Philadelphia), Haarlem (SMK), Ingres (Granet), Juno and Argus (Wallraf), the Varvakeion Athena and Great Eleusinian Relief (NAMA), Bernini (Borghese), Exekias (Munich and Vatican), Sosias (Berlin F2278), the Siren Painter (BM E440), the Eleusis amphora, the Orpheus relief (Louvre Ma 854), Corot (Houston), Waterhouse (NGV, Walker), Bruegel (Brussels, "after"), Rhea pelike (Met 06.1021.144) and the Tellus mosaic (Glyptothek W504). Factual look details checked against Commons descriptions are also fine: 7 dolphins, 1877/1820 finds, 3 apples, Corona Borealis, Leochares, Bernini's 1622 restoration and so on.

checked: 97 entries (~390 field claims), 3 sources opened plus meta.json for all (Commons pages UNREACHABLE; used meta.json API fields; Artlyst and a BM/Beazley search for two museums)

## Summary by severity

- WRONG: 2
- UNSUPPORTED: 13
- LINK: 3 (the Strabo `1B*` link affects 5 rows)
- STYLE: 8
- UNREACHABLE: Commons file pages (all 97; checked via the meta.json API data instead)
