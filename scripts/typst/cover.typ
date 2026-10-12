// Cover der EPUB-Leseprobe (1600 × 2400 Pixel bei 72 ppi).
#import "titelblatt.typ": titelblatt
#let daten = json("daten.json")
#set page(width: 1600pt, height: 2400pt, margin: 0pt)
#titelblatt(daten, 1600pt)
