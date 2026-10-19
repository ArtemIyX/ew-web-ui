# Lineage II Legacy UI Color System

> A screenshot-grounded, production-oriented palette for recreating the classic Lineage II interface in UE5, web UI, design tools, or a custom client.
>
> **Scope:** Chronicle 4 through Interlude is the visual baseline. Later legacy/High Five captures are secondary references only when they preserve the same dark olive, bronze, and warm-ivory language.
>
> **Deliverable:** 120 unique color swatches, 32 semantic aliases, opacity recipes, screenshot references, extraction notes, and implementation guidance.

**Research date:** 2 September 2026  
**Color space:** sRGB for HEX/RGB; converted linear values for Unreal Engine  
**Status:** Reconstruction from preserved screenshots, not an NCSoft-issued canonical palette

---

## 1. Executive summary

Classic Lineage II UI is not simply “black and gold.” Its identity comes from five interacting choices:

1. **Near-black surfaces lean olive and brown**, not neutral blue-gray.
2. **Frames use muted aged bronze**, with narrow warm highlights and very dark inner bevels.
3. **Text is warm ivory**, rarely pure white.
4. **State colors are saturated inside thin bars and icons**, while surrounding chrome remains subdued.
5. **Transparency lets the 3D world color the interface**, so a single screenshot can make the same texture appear warmer, cooler, lighter, or darker.

The safest reconstruction is therefore a layered system: dark translucent surfaces, restrained bronze structure, ivory typography, and narrow semantic ramps for HP, MP, CP, party, chat, and item state.

### Recommended core 16

| Role | Color | HEX |
|---|---|---:|
| Screen dim | <span style="display:inline-block;width:2.8em;background-color:#080907;color:#080907;border:thin solid #777;">██</span> | `#080907` |
| Window base | <span style="display:inline-block;width:2.8em;background-color:#1A1B17;color:#1A1B17;border:thin solid #777;">██</span> | `#1A1B17` |
| Raised panel | <span style="display:inline-block;width:2.8em;background-color:#2F3029;color:#2F3029;border:thin solid #777;">██</span> | `#2F3029` |
| Control surface | <span style="display:inline-block;width:2.8em;background-color:#45443A;color:#45443A;border:thin solid #777;">██</span> | `#45443A` |
| Border shadow | <span style="display:inline-block;width:2.8em;background-color:#3B3328;color:#3B3328;border:thin solid #777;">██</span> | `#3B3328` |
| Border bronze | <span style="display:inline-block;width:2.8em;background-color:#887C5E;color:#887C5E;border:thin solid #777;">██</span> | `#887C5E` |
| Border highlight | <span style="display:inline-block;width:2.8em;background-color:#B49A75;color:#B49A75;border:thin solid #777;">██</span> | `#B49A75` |
| Primary text | <span style="display:inline-block;width:2.8em;background-color:#D7D5BD;color:#D7D5BD;border:thin solid #777;">██</span> | `#D7D5BD` |
| Secondary text | <span style="display:inline-block;width:2.8em;background-color:#B7AF95;color:#B7AF95;border:thin solid #777;">██</span> | `#B7AF95` |
| Disabled text | <span style="display:inline-block;width:2.8em;background-color:#746F60;color:#746F60;border:thin solid #777;">██</span> | `#746F60` |
| HP | <span style="display:inline-block;width:2.8em;background-color:#B42938;color:#B42938;border:thin solid #777;">██</span> | `#B42938` |
| MP | <span style="display:inline-block;width:2.8em;background-color:#315F9F;color:#315F9F;border:thin solid #777;">██</span> | `#315F9F` |
| CP / XP | <span style="display:inline-block;width:2.8em;background-color:#A47414;color:#A47414;border:thin solid #777;">██</span> | `#A47414` |
| Success / party | <span style="display:inline-block;width:2.8em;background-color:#64834C;color:#64834C;border:thin solid #777;">██</span> | `#64834C` |
| System / magic | <span style="display:inline-block;width:2.8em;background-color:#4B8F93;color:#4B8F93;border:thin solid #777;">██</span> | `#4B8F93` |
| Trade / warning | <span style="display:inline-block;width:2.8em;background-color:#B66D35;color:#B66D35;border:thin solid #777;">██</span> | `#B66D35` |

---

## 2. Evidence set

The following images were used as visual evidence. The direct images are embedded so the report remains useful as a visual reference; each caption links to the page that provides its historical or contextual provenance.

### 2.1 Preserved official interface guide

![Annotated Lineage II interface](https://legacy-lineage2.com/images/interface_000.jpg)

The preserved official guide identifies the status window, target window, shortcut window, chat/system messages, menu bar, party window, and radar. It also explicitly documents radar-area semantics: gray for general fields, blue for peaceful zones, red for altered zones, orange for siege zones, and green for PvP arenas. [Preserved official Game Interface guide](https://legacy-lineage2.com/guide/interface.html)

### 2.2 Chronicle 4 separate chat windows

![Chronicle 4 chat interface](https://legacy-lineage2.com/images/news/interface-1.jpg)

Chronicle 4 introduced a separate system-message window and detachable chat-channel windows. This screenshot is particularly useful for translucent panel blacks, olive-brown borders, inactive tabs, and cyan/system text. [Chronicle 4 interface changes](https://legacy-lineage2.com/news/chronicle4_13.html)

### 2.3 Chronicle 4 enchant window

![Chronicle 4 enchant window](https://legacy-lineage2.com/images/news/interface-2.jpg)

The enchant dialog exposes the darkest window fill, slot wells, grid lines, title-bar blue-gray, button treatment, and the narrow bronze edge. [Chronicle 4 interface changes](https://legacy-lineage2.com/news/chronicle4_13.html)

### 2.4 Inventory close-up

![Lineage II inventory interface](https://img.inven.co.kr/column/jukz_lineage2_pre2/%2846%2920100809182108720.jpg)

This Korean guide capture is useful for the large window frame, equipment slots, active/inactive tabs, inventory grid, weight gauge, and adena readout. It is later than the strict C4 baseline, so it is used as corroborating evidence rather than as the sole source. [Lineage II Inven interface guide](https://lineage2.inven.co.kr/dataninfo/guide/)

### 2.5 Interlude marketplace and inventory

![Interlude marketplace UI](https://4.bp.blogspot.com/-jGSF8utYIzI/VIWaSUfkReI/AAAAAAAAERw/VV8EuOo0r8c/s1600/Shot00060.bmp)

This high-resolution Interlude capture contains the classic status bars, chat tabs, trade chat, private-store labels, inventory, hotbars, item slots, currency, and weight gauge in one frame. [Random Interlude screenshots](https://l2exp.blogspot.com/2014/12/random-interlude-screenshots.html)

### 2.6 Status, party, skills, radar, and chat

![Legacy Lineage II status and skills UI](https://1.bp.blogspot.com/-MWGD2Xv-Vls/Up4lyKn-IsI/AAAAAAAACHQ/n5sOG5oH6bs/s1600/Shot00179.bmp)

This capture provides large status and skills windows, party gauges, chat, hotbars, buttons, and radar framing. It is useful for validating that the bronze/olive language persists across larger panels. [Tyrant/Spoiler legacy screenshot post](https://l2exp.blogspot.com/2013/12/Tyrant-Spoiler-great-character-for-making-adena.html)

### Source-quality warning

Screenshots are affected by JPEG compression, client gamma, display capture settings, server-side UI modifications, background color bleeding through translucent panels, and chronicle differences. The palette below is therefore organized by confidence:

- **A — direct anchor:** a recurring screenshot cluster or bar sample.
- **B — cross-reference:** visually consistent across multiple captures.
- **C — derived ramp:** interpolated around A/B anchors for practical UI implementation.

The 120-color catalog contains deliberate C-tier shades. That is useful for production but must not be misrepresented as 120 literal constants extracted from NCSoft packages.

---

## 3. Extraction and reconstruction method

1. UI-only regions were cropped from seven screenshots: status, chat, system message, inventory, enchant, skills, party, radar, and hotbar areas.
2. Colors were quantized per crop to locate recurring surface and frame clusters.
3. High-saturation pixels were reviewed separately to prevent large dark panels from hiding HP/MP/CP and chat colors.
4. Near-duplicate JPEG values were consolidated into stable anchors.
5. Each anchor was expanded into a controlled ten-step ramp. Dark steps support translucent fills; light steps support bevels, text, hover, and accessibility variants.
6. HEX values remain the authoritative sRGB representation. Unreal values use the standard sRGB transfer function.

Recurring sampled clusters include:

- Dark surfaces: `#101010`, `#1A1B17`, `#1C1E19`, `#24201D`, `#2B2926`
- Olive structure: `#3F3B30`, `#43413D`, `#4C4B45`, `#646157`
- Bronze/frame: `#6E6043`, `#887C5E`, `#8B7A66`, `#92877C`
- Warm text: `#B7AF95`, `#BDB799`, `#C2B6A3`, `#C3B9A8`
- Bright bars: HP around `#C40414`; MP around `#045CD4`; CP around `#A47414`–`#C4A46C`
- Social/system accents: teal around `#73B0A1`; trade orange around `#CE9063`

---

## 4. Full 120-color palette

**Naming:** 950 is darkest, 500 is the reconstructed family anchor, and 100 is lightest.  
**Swatches:** inline HTML color is a convenience; the HEX value is authoritative if a Markdown renderer strips styles.  
**UE column:** values are linear RGB with alpha 1.0, suitable for `FLinearColor`.


### Void / translucent black

`#1A1B17` appears in inventory/window interiors; deepest values are reconstructed for compositing. Window interiors, chat backing, slot wells, modal dimming.

| Swatch | Token | HEX | RGB 8-bit | UE linear RGBA |
|---|---|---:|---:|---:|
| <span style="display:inline-block;width:2.8em;background-color:#080907;color:#080907;border:thin solid #777;">██</span> | `L2-Void-950` | `#080907` | `8, 9, 7` | `(0.0024, 0.0027, 0.0021, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#0C0D0A;color:#0C0D0A;border:thin solid #777;">██</span> | `L2-Void-900` | `#0C0D0A` | `12, 13, 10` | `(0.0037, 0.0040, 0.0030, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#0F100D;color:#0F100D;border:thin solid #777;">██</span> | `L2-Void-800` | `#0F100D` | `15, 16, 13` | `(0.0048, 0.0052, 0.0040, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#131411;color:#131411;border:thin solid #777;">██</span> | `L2-Void-700` | `#131411` | `19, 20, 17` | `(0.0065, 0.0070, 0.0056, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#161714;color:#161714;border:thin solid #777;">██</span> | `L2-Void-600` | `#161714` | `22, 23, 20` | `(0.0080, 0.0086, 0.0070, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#1A1B17;color:#1A1B17;border:thin solid #777;">██</span> | `L2-Void-500` | `#1A1B17` | `26, 27, 23` | `(0.0103, 0.0110, 0.0086, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#2C2E29;color:#2C2E29;border:thin solid #777;">██</span> | `L2-Void-400` | `#2C2E29` | `44, 46, 41` | `(0.0252, 0.0273, 0.0222, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#3E413B;color:#3E413B;border:thin solid #777;">██</span> | `L2-Void-300` | `#3E413B` | `62, 65, 59` | `(0.0482, 0.0529, 0.0437, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#50534C;color:#50534C;border:thin solid #777;">██</span> | `L2-Void-200` | `#50534C` | `80, 83, 76` | `(0.0802, 0.0865, 0.0723, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#62665E;color:#62665E;border:thin solid #777;">██</span> | `L2-Void-100` | `#62665E` | `98, 102, 94` | `(0.1221, 0.1329, 0.1119, 1.0)` |

### Olive stone / neutral structure

Built around recurring `#3F3B30`, `#43413D`, `#4C4B45`, and adjacent clusters. Panel layers, inactive tabs, separators, controls.

| Swatch | Token | HEX | RGB 8-bit | UE linear RGBA |
|---|---|---:|---:|---:|
| <span style="display:inline-block;width:2.8em;background-color:#12130F;color:#12130F;border:thin solid #777;">██</span> | `L2-Stone-950` | `#12130F` | `18, 19, 15` | `(0.0060, 0.0065, 0.0048, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#1C1D18;color:#1C1D18;border:thin solid #777;">██</span> | `L2-Stone-900` | `#1C1D18` | `28, 29, 24` | `(0.0116, 0.0123, 0.0091, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#262720;color:#262720;border:thin solid #777;">██</span> | `L2-Stone-800` | `#262720` | `38, 39, 32` | `(0.0194, 0.0203, 0.0144, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#313029;color:#313029;border:thin solid #777;">██</span> | `L2-Stone-700` | `#313029` | `49, 48, 41` | `(0.0307, 0.0296, 0.0222, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#3B3A31;color:#3B3A31;border:thin solid #777;">██</span> | `L2-Stone-600` | `#3B3A31` | `59, 58, 49` | `(0.0437, 0.0423, 0.0307, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#45443A;color:#45443A;border:thin solid #777;">██</span> | `L2-Stone-500` | `#45443A` | `69, 68, 58` | `(0.0595, 0.0578, 0.0423, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#5E5C4F;color:#5E5C4F;border:thin solid #777;">██</span> | `L2-Stone-400` | `#5E5C4F` | `94, 92, 79` | `(0.1119, 0.1070, 0.0782, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#787564;color:#787564;border:thin solid #777;">██</span> | `L2-Stone-300` | `#787564` | `120, 117, 100` | `(0.1878, 0.1779, 0.1274, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#918D79;color:#918D79;border:thin solid #777;">██</span> | `L2-Stone-200` | `#918D79` | `145, 141, 121` | `(0.2831, 0.2664, 0.1912, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#AAA58E;color:#AAA58E;border:thin solid #777;">██</span> | `L2-Stone-100` | `#AAA58E` | `170, 165, 142` | `(0.4020, 0.3763, 0.2705, 1.0)` |

### Muted bronze / frame metal

`#887C5E`, `#8C7C5E`, and `#8B7A66` recur on legacy frames and ornamental edges. Frames, bevels, focused tabs, selected ornaments.

| Swatch | Token | HEX | RGB 8-bit | UE linear RGBA |
|---|---|---:|---:|---:|
| <span style="display:inline-block;width:2.8em;background-color:#211A11;color:#211A11;border:thin solid #777;">██</span> | `L2-Bronze-950` | `#211A11` | `33, 26, 17` | `(0.0152, 0.0103, 0.0056, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#362E20;color:#362E20;border:thin solid #777;">██</span> | `L2-Bronze-900` | `#362E20` | `54, 46, 32` | `(0.0369, 0.0273, 0.0144, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#4A4130;color:#4A4130;border:thin solid #777;">██</span> | `L2-Bronze-800` | `#4A4130` | `74, 65, 48` | `(0.0685, 0.0529, 0.0296, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#5F553F;color:#5F553F;border:thin solid #777;">██</span> | `L2-Bronze-700` | `#5F553F` | `95, 85, 63` | `(0.1144, 0.0908, 0.0497, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#73684F;color:#73684F;border:thin solid #777;">██</span> | `L2-Bronze-600` | `#73684F` | `115, 104, 79` | `(0.1714, 0.1384, 0.0782, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#887C5E;color:#887C5E;border:thin solid #777;">██</span> | `L2-Bronze-500` | `#887C5E` | `136, 124, 94` | `(0.2462, 0.2016, 0.1119, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#9E9170;color:#9E9170;border:thin solid #777;">██</span> | `L2-Bronze-400` | `#9E9170` | `158, 145, 112` | `(0.3419, 0.2831, 0.1620, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#B4A781;color:#B4A781;border:thin solid #777;">██</span> | `L2-Bronze-300` | `#B4A781` | `180, 167, 129` | `(0.4564, 0.3864, 0.2195, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#CABC93;color:#CABC93;border:thin solid #777;">██</span> | `L2-Bronze-200` | `#CABC93` | `202, 188, 147` | `(0.5906, 0.5029, 0.2918, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#E0D1A4;color:#E0D1A4;border:thin solid #777;">██</span> | `L2-Bronze-100` | `#E0D1A4` | `224, 209, 164` | `(0.7454, 0.6376, 0.3712, 1.0)` |

### Warm ivory / readable text

Centered on sampled `#B7AF95`, `#BDB799`, `#C2B6A3`, and official-guide `#C3B9A8`. Primary/secondary text, labels, numerical values.

| Swatch | Token | HEX | RGB 8-bit | UE linear RGBA |
|---|---|---:|---:|---:|
| <span style="display:inline-block;width:2.8em;background-color:#2A2923;color:#2A2923;border:thin solid #777;">██</span> | `L2-Ivory-950` | `#2A2923` | `42, 41, 35` | `(0.0232, 0.0222, 0.0168, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#46443A;color:#46443A;border:thin solid #777;">██</span> | `L2-Ivory-900` | `#46443A` | `70, 68, 58` | `(0.0612, 0.0578, 0.0423, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#625F51;color:#625F51;border:thin solid #777;">██</span> | `L2-Ivory-800` | `#625F51` | `98, 95, 81` | `(0.1221, 0.1144, 0.0823, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#7F7967;color:#7F7967;border:thin solid #777;">██</span> | `L2-Ivory-700` | `#7F7967` | `127, 121, 103` | `(0.2122, 0.1912, 0.1356, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#9B947E;color:#9B947E;border:thin solid #777;">██</span> | `L2-Ivory-600` | `#9B947E` | `155, 148, 126` | `(0.3278, 0.2961, 0.2086, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#B7AF95;color:#B7AF95;border:thin solid #777;">██</span> | `L2-Ivory-500` | `#B7AF95` | `183, 175, 149` | `(0.4735, 0.4287, 0.3005, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#C9C2A9;color:#C9C2A9;border:thin solid #777;">██</span> | `L2-Ivory-400` | `#C9C2A9` | `201, 194, 169` | `(0.5841, 0.5395, 0.3968, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#DBD5BE;color:#DBD5BE;border:thin solid #777;">██</span> | `L2-Ivory-300` | `#DBD5BE` | `219, 213, 190` | `(0.7084, 0.6654, 0.5149, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#EDE8D2;color:#EDE8D2;border:thin solid #777;">██</span> | `L2-Ivory-200` | `#EDE8D2` | `237, 232, 210` | `(0.8469, 0.8070, 0.6445, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#FFFBE6;color:#FFFBE6;border:thin solid #777;">██</span> | `L2-Ivory-100` | `#FFFBE6` | `255, 251, 230` | `(1.0000, 0.9647, 0.7913, 1.0)` |

### HP crimson

Legacy status bars produced bright samples such as `#C40414`; `#B42938` is the more reusable midtone. HP, damage, destructive actions, critical error.

| Swatch | Token | HEX | RGB 8-bit | UE linear RGBA |
|---|---|---:|---:|---:|
| <span style="display:inline-block;width:2.8em;background-color:#26080C;color:#26080C;border:thin solid #777;">██</span> | `L2-Hp-950` | `#26080C` | `38, 8, 12` | `(0.0194, 0.0024, 0.0037, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#420F15;color:#420F15;border:thin solid #777;">██</span> | `L2-Hp-900` | `#420F15` | `66, 15, 21` | `(0.0545, 0.0048, 0.0075, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#5F151E;color:#5F151E;border:thin solid #777;">██</span> | `L2-Hp-800` | `#5F151E` | `95, 21, 30` | `(0.1144, 0.0075, 0.0130, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#7B1C26;color:#7B1C26;border:thin solid #777;">██</span> | `L2-Hp-700` | `#7B1C26` | `123, 28, 38` | `(0.1981, 0.0116, 0.0194, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#98222F;color:#98222F;border:thin solid #777;">██</span> | `L2-Hp-600` | `#98222F` | `152, 34, 47` | `(0.3140, 0.0160, 0.0284, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#B42938;color:#B42938;border:thin solid #777;">██</span> | `L2-Hp-500` | `#B42938` | `180, 41, 56` | `(0.4564, 0.0222, 0.0395, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#C7454E;color:#C7454E;border:thin solid #777;">██</span> | `L2-Hp-400` | `#C7454E` | `199, 69, 78` | `(0.5711, 0.0595, 0.0762, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#DA6265;color:#DA6265;border:thin solid #777;">██</span> | `L2-Hp-300` | `#DA6265` | `218, 98, 101` | `(0.7011, 0.1221, 0.1301, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#EC7E7B;color:#EC7E7B;border:thin solid #777;">██</span> | `L2-Hp-200` | `#EC7E7B` | `236, 126, 123` | `(0.8388, 0.2086, 0.1981, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#FF9A91;color:#FF9A91;border:thin solid #777;">██</span> | `L2-Hp-100` | `#FF9A91` | `255, 154, 145` | `(1.0000, 0.3231, 0.2831, 1.0)` |

### MP cobalt

Status-bar samples include `#045CD4`, `#0474E4`, `#447CBC`; the ramp is moderated for text and surfaces. MP, magic, information, focus accents.

| Swatch | Token | HEX | RGB 8-bit | UE linear RGBA |
|---|---|---:|---:|---:|
| <span style="display:inline-block;width:2.8em;background-color:#07152B;color:#07152B;border:thin solid #777;">██</span> | `L2-Mp-950` | `#07152B` | `7, 21, 43` | `(0.0021, 0.0075, 0.0242, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#0F2442;color:#0F2442;border:thin solid #777;">██</span> | `L2-Mp-900` | `#0F2442` | `15, 36, 66` | `(0.0048, 0.0176, 0.0545, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#183359;color:#183359;border:thin solid #777;">██</span> | `L2-Mp-800` | `#183359` | `24, 51, 89` | `(0.0091, 0.0331, 0.0999, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#204171;color:#204171;border:thin solid #777;">██</span> | `L2-Mp-700` | `#204171` | `32, 65, 113` | `(0.0144, 0.0529, 0.1651, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#295088;color:#295088;border:thin solid #777;">██</span> | `L2-Mp-600` | `#295088` | `41, 80, 136` | `(0.0222, 0.0802, 0.2462, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#315F9F;color:#315F9F;border:thin solid #777;">██</span> | `L2-Mp-500` | `#315F9F` | `49, 95, 159` | `(0.0307, 0.1144, 0.3467, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#4B7DB7;color:#4B7DB7;border:thin solid #777;">██</span> | `L2-Mp-400` | `#4B7DB7` | `75, 125, 183` | `(0.0704, 0.2051, 0.4735, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#659ACF;color:#659ACF;border:thin solid #777;">██</span> | `L2-Mp-300` | `#659ACF` | `101, 154, 207` | `(0.1301, 0.3231, 0.6240, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#7FB8E7;color:#7FB8E7;border:thin solid #777;">██</span> | `L2-Mp-200` | `#7FB8E7` | `127, 184, 231` | `(0.2122, 0.4793, 0.7991, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#99D5FF;color:#99D5FF;border:thin solid #777;">██</span> | `L2-Mp-100` | `#99D5FF` | `153, 213, 255` | `(0.3185, 0.6654, 1.0000, 1.0)` |

### CP / experience amber

Centered on legacy CP clusters `#A47414`, `#B48C3C`, `#C4A46C` and gold UI highlights. CP, experience, progress, currency, attention.

| Swatch | Token | HEX | RGB 8-bit | UE linear RGBA |
|---|---|---:|---:|---:|
| <span style="display:inline-block;width:2.8em;background-color:#2C1B04;color:#2C1B04;border:thin solid #777;">██</span> | `L2-Cp-950` | `#2C1B04` | `44, 27, 4` | `(0.0252, 0.0110, 0.0012, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#442D07;color:#442D07;border:thin solid #777;">██</span> | `L2-Cp-900` | `#442D07` | `68, 45, 7` | `(0.0578, 0.0262, 0.0021, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#5C3F0A;color:#5C3F0A;border:thin solid #777;">██</span> | `L2-Cp-800` | `#5C3F0A` | `92, 63, 10` | `(0.1070, 0.0497, 0.0030, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#74500E;color:#74500E;border:thin solid #777;">██</span> | `L2-Cp-700` | `#74500E` | `116, 80, 14` | `(0.1746, 0.0802, 0.0044, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#8C6211;color:#8C6211;border:thin solid #777;">██</span> | `L2-Cp-600` | `#8C6211` | `140, 98, 17` | `(0.2623, 0.1221, 0.0056, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#A47414;color:#A47414;border:thin solid #777;">██</span> | `L2-Cp-500` | `#A47414` | `164, 116, 20` | `(0.3712, 0.1746, 0.0070, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#BB8F2E;color:#BB8F2E;border:thin solid #777;">██</span> | `L2-Cp-400` | `#BB8F2E` | `187, 143, 46` | `(0.4969, 0.2747, 0.0273, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#D2AA47;color:#D2AA47;border:thin solid #777;">██</span> | `L2-Cp-300` | `#D2AA47` | `210, 170, 71` | `(0.6445, 0.4020, 0.0630, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#E8C561;color:#E8C561;border:thin solid #777;">██</span> | `L2-Cp-200` | `#E8C561` | `232, 197, 97` | `(0.8070, 0.5583, 0.1195, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#FFE07A;color:#FFE07A;border:thin solid #777;">██</span> | `L2-Cp-100` | `#FFE07A` | `255, 224, 122` | `(1.0000, 0.7454, 0.1946, 1.0)` |

### Party / success green

Reconstructed from party/radar greens and the official guide’s green PvP-area semantics. Party, success, valid state, positive status.

| Swatch | Token | HEX | RGB 8-bit | UE linear RGBA |
|---|---|---:|---:|---:|
| <span style="display:inline-block;width:2.8em;background-color:#101A0B;color:#101A0B;border:thin solid #777;">██</span> | `L2-Green-950` | `#101A0B` | `16, 26, 11` | `(0.0052, 0.0103, 0.0033, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#212F18;color:#212F18;border:thin solid #777;">██</span> | `L2-Green-900` | `#212F18` | `33, 47, 24` | `(0.0152, 0.0284, 0.0091, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#324425;color:#324425;border:thin solid #777;">██</span> | `L2-Green-800` | `#324425` | `50, 68, 37` | `(0.0319, 0.0578, 0.0185, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#425932;color:#425932;border:thin solid #777;">██</span> | `L2-Green-700` | `#425932` | `66, 89, 50` | `(0.0545, 0.0999, 0.0319, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#536E3F;color:#536E3F;border:thin solid #777;">██</span> | `L2-Green-600` | `#536E3F` | `83, 110, 63` | `(0.0865, 0.1559, 0.0497, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#64834C;color:#64834C;border:thin solid #777;">██</span> | `L2-Green-500` | `#64834C` | `100, 131, 76` | `(0.1274, 0.2270, 0.0723, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#7A9D5D;color:#7A9D5D;border:thin solid #777;">██</span> | `L2-Green-400` | `#7A9D5D` | `122, 157, 93` | `(0.1946, 0.3372, 0.1095, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#90B76F;color:#90B76F;border:thin solid #777;">██</span> | `L2-Green-300` | `#90B76F` | `144, 183, 111` | `(0.2789, 0.4735, 0.1590, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#A6D180;color:#A6D180;border:thin solid #777;">██</span> | `L2-Green-200` | `#A6D180` | `166, 209, 128` | `(0.3813, 0.6376, 0.2159, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#BCEB91;color:#BCEB91;border:thin solid #777;">██</span> | `L2-Green-100` | `#BCEB91` | `188, 235, 145` | `(0.5029, 0.8308, 0.2831, 1.0)` |

### System / magical cyan

Centered on cyan/teal UI text and clusters such as `#73B0A1`, while excluding the guide’s bright annotation overlay. System text, enchantment, link-like emphasis, magic.

| Swatch | Token | HEX | RGB 8-bit | UE linear RGBA |
|---|---|---:|---:|---:|
| <span style="display:inline-block;width:2.8em;background-color:#071B1D;color:#071B1D;border:thin solid #777;">██</span> | `L2-Cyan-950` | `#071B1D` | `7, 27, 29` | `(0.0021, 0.0110, 0.0123, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#153235;color:#153235;border:thin solid #777;">██</span> | `L2-Cyan-900` | `#153235` | `21, 50, 53` | `(0.0075, 0.0319, 0.0356, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#22494C;color:#22494C;border:thin solid #777;">██</span> | `L2-Cyan-800` | `#22494C` | `34, 73, 76` | `(0.0160, 0.0666, 0.0723, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#306164;color:#306164;border:thin solid #777;">██</span> | `L2-Cyan-700` | `#306164` | `48, 97, 100` | `(0.0296, 0.1195, 0.1274, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#3D787B;color:#3D787B;border:thin solid #777;">██</span> | `L2-Cyan-600` | `#3D787B` | `61, 120, 123` | `(0.0467, 0.1878, 0.1981, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#4B8F93;color:#4B8F93;border:thin solid #777;">██</span> | `L2-Cyan-500` | `#4B8F93` | `75, 143, 147` | `(0.0704, 0.2747, 0.2918, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#62A7A9;color:#62A7A9;border:thin solid #777;">██</span> | `L2-Cyan-400` | `#62A7A9` | `98, 167, 169` | `(0.1221, 0.3864, 0.3968, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#79C0C0;color:#79C0C0;border:thin solid #777;">██</span> | `L2-Cyan-300` | `#79C0C0` | `121, 192, 192` | `(0.1912, 0.5271, 0.5271, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#90D8D6;color:#90D8D6;border:thin solid #777;">██</span> | `L2-Cyan-200` | `#90D8D6` | `144, 216, 214` | `(0.2789, 0.6867, 0.6724, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#A7F0EC;color:#A7F0EC;border:thin solid #777;">██</span> | `L2-Cyan-100` | `#A7F0EC` | `167, 240, 236` | `(0.3864, 0.8714, 0.8388, 1.0)` |

### Trade / warning orange

Chat and market captures yield `#CE9063`, `#B27556`, and neighboring orange-brown values. Trade chat, warning, marketplace, warm highlight.

| Swatch | Token | HEX | RGB 8-bit | UE linear RGBA |
|---|---|---:|---:|---:|
| <span style="display:inline-block;width:2.8em;background-color:#281106;color:#281106;border:thin solid #777;">██</span> | `L2-Orange-950` | `#281106` | `40, 17, 6` | `(0.0212, 0.0056, 0.0018, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#44230F;color:#44230F;border:thin solid #777;">██</span> | `L2-Orange-900` | `#44230F` | `68, 35, 15` | `(0.0578, 0.0168, 0.0048, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#613619;color:#613619;border:thin solid #777;">██</span> | `L2-Orange-800` | `#613619` | `97, 54, 25` | `(0.1195, 0.0369, 0.0097, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#7D4822;color:#7D4822;border:thin solid #777;">██</span> | `L2-Orange-700` | `#7D4822` | `125, 72, 34` | `(0.2051, 0.0648, 0.0160, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#9A5B2C;color:#9A5B2C;border:thin solid #777;">██</span> | `L2-Orange-600` | `#9A5B2C` | `154, 91, 44` | `(0.3231, 0.1046, 0.0252, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#B66D35;color:#B66D35;border:thin solid #777;">██</span> | `L2-Orange-500` | `#B66D35` | `182, 109, 53` | `(0.4678, 0.1529, 0.0356, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#C8834D;color:#C8834D;border:thin solid #777;">██</span> | `L2-Orange-400` | `#C8834D` | `200, 131, 77` | `(0.5776, 0.2270, 0.0742, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#DB9964;color:#DB9964;border:thin solid #777;">██</span> | `L2-Orange-300` | `#DB9964` | `219, 153, 100` | `(0.7084, 0.3185, 0.1274, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#EDAE7C;color:#EDAE7C;border:thin solid #777;">██</span> | `L2-Orange-200` | `#EDAE7C` | `237, 174, 124` | `(0.8469, 0.4233, 0.2016, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#FFC493;color:#FFC493;border:thin solid #777;">██</span> | `L2-Orange-100` | `#FFC493` | `255, 196, 147` | `(1.0000, 0.5520, 0.2918, 1.0)` |

### Whisper / private-store magenta

Reconstructed from whisper/private-store labels visible in Interlude marketplace screenshots. Whispers, private stores, special social channels.

| Swatch | Token | HEX | RGB 8-bit | UE linear RGBA |
|---|---|---:|---:|---:|
| <span style="display:inline-block;width:2.8em;background-color:#260D22;color:#260D22;border:thin solid #777;">██</span> | `L2-Magenta-950` | `#260D22` | `38, 13, 34` | `(0.0194, 0.0040, 0.0160, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#401D3A;color:#401D3A;border:thin solid #777;">██</span> | `L2-Magenta-900` | `#401D3A` | `64, 29, 58` | `(0.0513, 0.0123, 0.0423, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#5A2C51;color:#5A2C51;border:thin solid #777;">██</span> | `L2-Magenta-800` | `#5A2C51` | `90, 44, 81` | `(0.1022, 0.0252, 0.0823, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#743C69;color:#743C69;border:thin solid #777;">██</span> | `L2-Magenta-700` | `#743C69` | `116, 60, 105` | `(0.1746, 0.0452, 0.1413, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#8E4B80;color:#8E4B80;border:thin solid #777;">██</span> | `L2-Magenta-600` | `#8E4B80` | `142, 75, 128` | `(0.2705, 0.0704, 0.2159, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#A85B98;color:#A85B98;border:thin solid #777;">██</span> | `L2-Magenta-500` | `#A85B98` | `168, 91, 152` | `(0.3916, 0.1046, 0.3140, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#BB70AA;color:#BB70AA;border:thin solid #777;">██</span> | `L2-Magenta-400` | `#BB70AA` | `187, 112, 170` | `(0.4969, 0.1620, 0.4020, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#CE86BC;color:#CE86BC;border:thin solid #777;">██</span> | `L2-Magenta-300` | `#CE86BC` | `206, 134, 188` | `(0.6172, 0.2384, 0.5029, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#E19BCD;color:#E19BCD;border:thin solid #777;">██</span> | `L2-Magenta-200` | `#E19BCD` | `225, 155, 205` | `(0.7529, 0.3278, 0.6105, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#F4B0DF;color:#F4B0DF;border:thin solid #777;">██</span> | `L2-Magenta-100` | `#F4B0DF` | `244, 176, 223` | `(0.9047, 0.4342, 0.7379, 1.0)` |

### Rare / arcane purple

Built from skill/item icon purples and the historical lavender experience/readout family. Rare items, arcane effects, premium or exceptional state.

| Swatch | Token | HEX | RGB 8-bit | UE linear RGBA |
|---|---|---:|---:|---:|
| <span style="display:inline-block;width:2.8em;background-color:#160E2B;color:#160E2B;border:thin solid #777;">██</span> | `L2-Purple-950` | `#160E2B` | `22, 14, 43` | `(0.0080, 0.0044, 0.0242, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#271B41;color:#271B41;border:thin solid #777;">██</span> | `L2-Purple-900` | `#271B41` | `39, 27, 65` | `(0.0203, 0.0110, 0.0529, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#372857;color:#372857;border:thin solid #777;">██</span> | `L2-Purple-800` | `#372857` | `55, 40, 87` | `(0.0382, 0.0212, 0.0953, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#48346C;color:#48346C;border:thin solid #777;">██</span> | `L2-Purple-700` | `#48346C` | `72, 52, 108` | `(0.0648, 0.0343, 0.1500, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#584182;color:#584182;border:thin solid #777;">██</span> | `L2-Purple-600` | `#584182` | `88, 65, 130` | `(0.0976, 0.0529, 0.2232, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#694E98;color:#694E98;border:thin solid #777;">██</span> | `L2-Purple-500` | `#694E98` | `105, 78, 152` | `(0.1413, 0.0762, 0.3140, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#8166AF;color:#8166AF;border:thin solid #777;">██</span> | `L2-Purple-400` | `#8166AF` | `129, 102, 175` | `(0.2195, 0.1329, 0.4287, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#997EC7;color:#997EC7;border:thin solid #777;">██</span> | `L2-Purple-300` | `#997EC7` | `153, 126, 199` | `(0.3185, 0.2086, 0.5711, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#B195DE;color:#B195DE;border:thin solid #777;">██</span> | `L2-Purple-200` | `#B195DE` | `177, 149, 222` | `(0.4397, 0.3005, 0.7305, 1.0)` |
| <span style="display:inline-block;width:2.8em;background-color:#C9ADF5;color:#C9ADF5;border:thin solid #777;">██</span> | `L2-Purple-100` | `#C9ADF5` | `201, 173, 245` | `(0.5841, 0.4179, 0.9131, 1.0)` |


---

## 5. Semantic aliases

These aliases are the recommended starting tokens for an actual interface. They intentionally reuse the 120-color ramps.

### 5.1 Surfaces and frames

| Semantic token | Palette token | HEX | Suggested alpha | Usage |
|---|---|---:|---:|---|
| `surface.screenDim` | `L2-Void-950` | `#080907` | 0.62 | Modal screen dim |
| `surface.window` | `L2-Void-500` | `#1A1B17` | 0.84 | Main window |
| `surface.windowDense` | `L2-Void-600` | `#161714` | 0.94 | Inventory/status |
| `surface.panel` | `L2-Stone-700` | `#313029` | 0.78 | Internal group |
| `surface.control` | `L2-Stone-500` | `#45443A` | 0.68 | Button/tab |
| `surface.slot` | `L2-Void-900` | `#0C0D0A` | 0.90 | Empty item slot |
| `surface.tooltip` | `L2-Void-600` | `#161714` | 0.96 | Tooltip backing |
| `frame.outerShadow` | `L2-Bronze-950` | `#211A11` | 1.00 | Outer keyline |
| `frame.innerDark` | `L2-Bronze-800` | `#4A4130` | 1.00 | Inner bevel |
| `frame.normal` | `L2-Bronze-500` | `#887C5E` | 1.00 | Main frame |
| `frame.highlight` | `L2-Bronze-300` | `#B4A781` | 1.00 | Top/left bevel |
| `frame.focus` | `L2-Bronze-200` | `#CABC93` | 1.00 | Focus/selected |

### 5.2 Typography and iconography

| Semantic token | Palette token | HEX | Usage |
|---|---|---:|---|
| `text.primary` | `L2-Ivory-200` | `#EDE8D2` | Titles and primary values |
| `text.normal` | `L2-Ivory-300` | `#DBD5BE` | Body labels |
| `text.secondary` | `L2-Ivory-500` | `#B7AF95` | Secondary labels |
| `text.muted` | `L2-Ivory-700` | `#7F7967` | Hints and metadata |
| `text.disabled` | `L2-Stone-300` | `#787564` | Disabled action |
| `text.inverse` | `L2-Void-900` | `#0C0D0A` | Text on bright bars |
| `icon.normal` | `L2-Bronze-400` | `#9E9170` | Neutral glyph |
| `icon.hover` | `L2-Bronze-200` | `#CABC93` | Hover glyph |

### 5.3 Gameplay and communication

| Semantic token | Palette token | HEX | Usage |
|---|---|---:|---|
| `status.hp` | `L2-Hp-500` | `#B42938` | HP fill |
| `status.hpBright` | `L2-Hp-300` | `#DA6265` | HP highlight |
| `status.mp` | `L2-Mp-500` | `#315F9F` | MP fill |
| `status.mpBright` | `L2-Mp-300` | `#659ACF` | MP highlight |
| `status.cp` | `L2-Cp-500` | `#A47414` | CP fill |
| `status.xp` | `L2-Purple-300` | `#997EC7` | Experience/progression variant |
| `state.success` | `L2-Green-500` | `#64834C` | Success / valid |
| `state.warning` | `L2-Orange-500` | `#B66D35` | Warning |
| `state.error` | `L2-Hp-400` | `#C7454E` | Error |
| `chat.system` | `L2-Cyan-300` | `#79C0C0` | System message |
| `chat.trade` | `L2-Orange-300` | `#DB9964` | Trade |
| `chat.whisper` | `L2-Magenta-300` | `#CE86BC` | Whisper/private |
| `chat.party` | `L2-Green-300` | `#90B76F` | Party |
| `rarity.arcane` | `L2-Purple-300` | `#997EC7` | Rare/arcane |

---

## 6. Layer recipes

A legacy-looking panel is created by layering, not by choosing one opaque color.

### Standard window

| Layer | Color | Alpha | Notes |
|---|---:|---:|---|
| Drop shadow | `#080907` | 0.55 | 2–4 px offset or soft shadow |
| Outer keyline | `#211A11` | 1.00 | 1 px |
| Main frame | `#887C5E` | 0.95 | 1 px |
| Top/left highlight | `#B4A781` | 0.70 | Thin bevel |
| Bottom/right shade | `#4A4130` | 0.95 | Thin bevel |
| Interior fill | `#1A1B17` | 0.82–0.90 | Denser for inventory |
| Inner vignette | `#080907` | 0.18 | Optional |

### Item slot

| State | Fill | Border | Overlay |
|---|---:|---:|---:|
| Empty | `#0C0D0A` @ 0.90 | `#34342E` | none |
| Occupied | `#161714` @ 0.84 | `#514F44` | icon |
| Hover | `#2B2C25` @ 0.80 | `#B4A77E` | `#E0D1A4` @ 0.08 |
| Selected | `#3C382A` @ 0.82 | `#CABD91` | `#FFE07A` @ 0.10 |
| Disabled | `#12130F` @ 0.92 | `#34342E` | `#080907` @ 0.45 |

### Status bar

Use a three-band vertical treatment:

- top highlight: family 300 at 0.70
- body: family 500 at 1.00
- bottom shadow: family 800 at 0.85
- frame: `#211A11` outer, `#887C5E` highlight
- empty portion: `#10110E` at 0.92

This preserves the old glossy raster-bar character without using a modern neon gradient.

---

## 7. Contrast and accessibility

The original interface prioritized atmosphere and information density, not current accessibility targets. A faithful reconstruction can still improve readability without losing its identity.

- Use `L2-Ivory-300` or lighter for body text on `L2-Void-500`.
- Avoid bronze 500 as small text on dark translucent world backgrounds; reserve it for frames or large labels.
- Give chat text a 1 px near-black shadow or outline because background luminance changes constantly.
- Do not communicate HP/MP/CP only by hue; retain labels, placement, and distinct bar order.
- For selected/hover states, combine color with a border/value change.
- Test against bright snow, pale stone, dark dungeon, grass, and fire-lit backgrounds.
- Check contrast after transparency composition, not against the uncomposited source color.

A practical accessibility mode can lift body text from Ivory 500 to Ivory 200, increase window opacity from 0.82 to 0.92, and widen focus borders from 1 px to 2 px.

---

## 8. Unreal Engine 5 implementation

HEX colors are sRGB. Do not divide 8-bit channels by 255 and treat the result as already-linear if the value is intended to match an sRGB screenshot.

```cpp
static FLinearColor L2FromHex(const TCHAR* Hex)
{
    return FLinearColor::FromSRGBColor(FColor::FromHex(Hex));
}

const FLinearColor Window = L2FromHex(TEXT("#1A1B17"));
const FLinearColor Frame  = L2FromHex(TEXT("#887C5E"));
const FLinearColor Text   = L2FromHex(TEXT("#D3CFBD"));
const FLinearColor HP     = L2FromHex(TEXT("#B42938"));
const FLinearColor MP     = L2FromHex(TEXT("#315F9F"));
const FLinearColor CP     = L2FromHex(TEXT("#A47414"));
```

For UMG/Slate:

- keep palette tokens in a `UDataAsset`, style set, or centralized theme structure;
- store alpha separately from hue when the same surface is reused at multiple densities;
- use 9-slice boxes for raster-authentic frame corners;
- apply nearest or carefully controlled bilinear sampling to small ornamental textures;
- avoid large modern blur radii; the legacy look depends on crisp 1 px edges and low-frequency translucent fills;
- validate at the target DPI because a one-pixel frame can disappear after scaling.

---

## 9. CSS starter variables

```css
:root {
  --l2-surface-screen-dim: #080907;
  --l2-surface-window: #1a1b17;
  --l2-surface-panel: #2b2c25;
  --l2-surface-control: #45443a;
  --l2-surface-slot: #0c0d0a;

  --l2-frame-shadow: #211a11;
  --l2-frame-normal: #887c5e;
  --l2-frame-highlight: #b4a77e;
  --l2-frame-focus: #cabd91;

  --l2-text-primary: #e9e5d6;
  --l2-text-normal: #d3cfbd;
  --l2-text-secondary: #b7af95;
  --l2-text-disabled: #787569;

  --l2-hp: #b42938;
  --l2-mp: #315f9f;
  --l2-cp: #a47414;
  --l2-success: #64834c;
  --l2-system: #79bfbd;
  --l2-trade: #db9964;
  --l2-whisper: #ce86bc;
  --l2-rare: #9982c7;
}
```

---

## 10. What would make the palette canonical

The best next step is direct extraction from the target client build:

1. Record the exact chronicle and regional client build.
2. Back up the client.
3. Inspect packages such as `L2UI.utx` and `L2UI_CH3.utx`.
4. Export UI textures without display conversion or screenshot gamma.
5. Preserve alpha channels and mip levels.
6. Group pixels by asset role rather than quantizing the entire atlas.
7. Sample flat interior pixels, bevel bands, typography masks, and bars separately.
8. Compare exported values with in-client captures to identify runtime tinting.

Community documentation confirms that Lineage II UI work commonly involves encrypted Unreal packages, texture export, and tools such as L2Tool/UE package exporters. Treat third-party tools and client modification as build-specific and verify the rules of the server/client you target. [UTX texture discussion](https://maxcheaters.com/topic/238850-utx-textures/) · [Legacy editing overview](https://forum.ragezone.com/threads/guide-stuff-to-edit-lineage-2.132525/) · [Interface tool index](https://l2crypt.com/l2-tools/interface/)

---

## 11. Sources

- [Preserved Lineage II Game Interface guide](https://legacy-lineage2.com/guide/interface.html)
- [Chronicle 4 interface changes](https://legacy-lineage2.com/news/chronicle4_13.html)
- [Preserved official screenshot gallery](https://legacy-lineage2.com/downloads/screenshots.html)
- [Random Interlude screenshots](https://l2exp.blogspot.com/2014/12/random-interlude-screenshots.html)
- [Old C4/C5 screenshot archive](https://l2exp.blogspot.com/2013/12/old-lineage-2-c4c5-screenshots-gallery.html)
- [Lineage II Inven interface guide](https://lineage2.inven.co.kr/dataninfo/guide/)
- [UTX texture workflow discussion](https://maxcheaters.com/topic/238850-utx-textures/)
- [Lineage II client editing overview](https://forum.ragezone.com/threads/guide-stuff-to-edit-lineage-2.132525/)
- [System message color discussion](https://forum.ragezone.com/threads/systemmsg-e-dat-colors.171450/)
- [Chat coloring workflow](https://l2exp.blogspot.com/2013/11/l2lige-chat-colouring-in-lineage2-client.html)

---

## 12. License and attribution note

Lineage II, its interface, screenshots, logos, and associated designs belong to their respective rights holders, including NCSoft. The screenshots are referenced here for research, interoperability, and visual analysis. This document is an unofficial reconstruction and should not be presented as an official NCSoft style guide.
