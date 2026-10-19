# Game settings: UI inventory and backend contract

This is a handoff for implementing the current Settings window in the game client. It describes the **current UI model**, the **disconnected sample capabilities**, and the protobuf contract inspected in `ew2-client`. Sample defaults and ranges are not yet authoritative game values.

Sources: `src/views/game/types/gameSettings.ts`, `src/views/game/windows/GameSettingsWindow/`, `src/services/game/settings/`, and `C:/Users/xeuse/repos/ew2-client/Source/EwProtobuf/Public/Proto/Settings/{Settings,SettingsGraphics,SettingsRequests,SettingsResponses}.proto`. Backend implementation status was checked in `Source/EwUI/Private/Components/EwSettingsWebSocketComponent.cpp`.

## Identity and transport convention

- The UI snapshot contains `schemaVersion: 1`, a numeric `revision`, `video`, and `input`. The settings window edits a draft, sends changed `video` and/or `input` sections with a base revision, and expects current/default snapshots and capabilities from the host.
- The protobuf `SettingsType` has dedicated `WINDOWED_MODE` and `RESOLUTION` cases. These are unique controls and **do not need a Gameplay Tag**. Their protobuf messages are `WindowedModeMessage` and `ResolutionMessage`/`ResolutionArrayMessage`.
- The other 31 fields correspond one for one to the existing `GraphicsTags` enum in `SettingsGraphics.proto`. That enum is a numeric identifier list, **not** a registered Unreal Gameplay Tag. The `TAGGED_*` protobuf messages instead carry a `string tag`. No concrete settings tag strings or settings Gameplay Tag registrations were found. The `EW.Settings.*` strings below are **proposals for the backend to register and agree with the UI**, not claims about an existing wire contract. The backend must decide whether those strings are Gameplay Tag names, plain protocol keys, or whether `GraphicsTags` should be sent explicitly; the present tagged messages only contain strings.
- Suggested tagged message families: numeric controls use `TAGGED_SLIDER_DETAILED` for a read including `value/min/max/step`, then `TAGGED_SLIDER` or `TAGGED_VALUE` for a write; booleans use `TAGGED_SWITCH`; choices use `TAGGED_COMBO` and `TAGGED_COMBO_DETAILED`. The exact encoding of combo options and selected indices remains to be defined.

## Video: display

| UI path | Type and possible values | Disconnected sample default | Protobuf identity | Gameplay Tag |
| --- | --- | --- | --- | --- |
| `video.display.windowMode` | `WindowMode`: `fullscreen`, `borderless`, `windowed`; host supplies supported subset | `fullscreen` | `WINDOWED_MODE`; `WindowedModeType`: `FULLSCREEN=3`, `WINDOWED_FULLSCREEN=2` (UI `borderless`), `WINDOWED=1` | None; dedicated setting |
| `video.display.resolution` | `{ width: number, height: number, refreshRateHz?: number }`; select from host capabilities | `1920×1080 @ 60 Hz` | `RESOLUTION`; protobuf `ResolutionMessage` has `x` and `y` only | None; dedicated setting |

Disconnected sample resolutions: `1280×720 @ 60 Hz`, `1920×1080 @ 60 Hz`, `2560×1440 @ 144 Hz`. Resolution selection is disabled for `borderless`. A display mode or resolution change starts a 15-second keep/revert preview in the disconnected gateway.

## Video: visibility

| UI path | Type and possible values in disconnected sample | Default | Existing `GraphicsTags` | Proposed Gameplay Tag |
| --- | --- | --- | --- | --- |
| `video.visibility.brightness` | number, `0.5–1.5`, step `0.01` | `1` | `BRIGHTNESS=1` | `EW.Settings.Graphics.Brightness` |
| `video.visibility.characterVisibility` | number, `0–100`, step `1` | `100` | `CHARACTERS_RENDER_DISTANCE=2` | `EW.Settings.Graphics.CharacterVisibility` |
| `video.visibility.npcVisibility` | number, `0–100`, step `1` | `100` | `NPC_RENDER_DISTANCE=3` | `EW.Settings.Graphics.NpcVisibility` |

The UI labels the latter two as Characters and NPCs, with percentage-like sample values. Backend enum names say *render distance*. Confirm whether these control population, distance, or another visibility measure before binding them. The existing `UEwGameSettingsSubsystem` clamps brightness to `0–100`, while the UI sample uses `0.5–1.5`; these scales need an explicit conversion or revised capabilities.

## Video: graphics quality

`QualityLevel` is `low | medium | high | epic | cinematic`. The disconnected sample offers all five, defaulting each quality field to `high`. The UI maps these to Unreal quality ordinals `0–4` in `gameSettingsMapping.ts`; protobuf `GraphicsQuality` assigns `LOW=1` through `CINEMATIC=5` and reserves `0` for invalid. Do not send the UI ordinal as a protobuf enum value without conversion.

| UI path (`video.graphics.*`) | Type and possible values | Default | Existing `GraphicsTags` | Proposed Gameplay Tag |
| --- | --- | --- | --- | --- |
| `overallQuality` | `QualityLevel | custom`; `custom` is derived when groups differ; selecting a preset changes all quality groups | `high` | `OVERALL_QUALITY=4` | `EW.Settings.Graphics.OverallQuality` |
| `viewDistance` | `QualityLevel` | `high` | `VIEW_DISTANCE=5` | `EW.Settings.Graphics.ViewDistance` |
| `antiAliasingQuality` | `QualityLevel` | `high` | `AA_QUALITY=6` | `EW.Settings.Graphics.AntiAliasingQuality` |
| `shadowQuality` | `QualityLevel` | `high` | `SHADOWS_QUALITY=7` | `EW.Settings.Graphics.ShadowQuality` |
| `globalIlluminationQuality` | `QualityLevel` | `high` | `GLOBAL_ILLUMINATION_QUALITY=8` | `EW.Settings.Graphics.GlobalIlluminationQuality` |
| `reflectionQuality` | `QualityLevel` | `high` | `REFLECTIONS_QUALITY=9` | `EW.Settings.Graphics.ReflectionQuality` |
| `postProcessQuality` | `QualityLevel` | `high` | `POST_PROCESSING_QUALITY=10` | `EW.Settings.Graphics.PostProcessQuality` |
| `textureQuality` | `QualityLevel` | `high` | `TEXTURES_QUALITY=11` | `EW.Settings.Graphics.TextureQuality` |
| `effectsQuality` | `QualityLevel` | `high` | `EFFECTS_QUALITY=12` | `EW.Settings.Graphics.EffectsQuality` |
| `foliageQuality` | `QualityLevel` | `high` | `FOLIAGE_QUALITY=13` | `EW.Settings.Graphics.FoliageQuality` |
| `shadingQuality` | `QualityLevel` | `high` | `SHADING_QUALITY=14` | `EW.Settings.Graphics.ShadingQuality` |
| `landscapeQuality` | `QualityLevel` | `high` | `LANDSCAPE_QUALITY=15` | `EW.Settings.Graphics.LandscapeQuality` |
| `antiAliasingMethod` | `none | fxaa | taa | tsr | smaa`; disconnected capabilities offer the first four | `taa` | `AA_METHOD=16` | `EW.Settings.Graphics.AntiAliasingMethod` |

`GraphicsQuality` also has `GRAPHICS_QUALITY_CUSTOM_RAIL=6`; this corresponds to the UI's derived `custom`, rather than a sixth quality level for an individual group. `AntiaAliasingMethod` in protobuf defines `NONE`, `FXAA`, `TAA`, and `TSR`, but has no `SMAA`. The C++ settings subsystem does have an `EEWAAMethod::SMAA` value. A connected host should advertise only methods it can serialize and apply.

## Video: super resolution

| UI path | Type and possible values | Default | Existing `GraphicsTags` | Proposed Gameplay Tag |
| --- | --- | --- | --- | --- |
| `video.superResolution.method` | `native | dlss`; host advertises supported methods | `native` | `UPSCALER=17` | `EW.Settings.Graphics.Upscaler` |
| `video.superResolution.dlssMode` | `dlaa | quality | balanced | performance | ultra-performance`; available while method is `dlss` | `quality` | `DLSS_MODE=18` | `EW.Settings.Graphics.DlssMode` |
| `video.superResolution.frameGenerationMode` | `off | 2x | 3x | 4x`; host advertises supported modes | `off` | `FRAME_GEN=19` | `EW.Settings.Graphics.FrameGeneration` |

The sample permits frame generation only with DLSS and forces `off` with `native`. UI validation requires anti-aliasing method `taa` when DLSS is selected; DLAA forces render scale to `100`. Protobuf `UpscalerMethod` defines `UPSCALER_DLSS=1` but no explicit native/off value (zero is `UPSCALER_INVALID`). Protobuf `DlssMode` covers the five UI choices. There is no frame-generation mode enum in the inspected settings proto; the backend must define stable combo indices or a typed enum. `FGraphicsSettings` in `ClientConfigTypes.h` has additional Off/Auto/FSR and frame-generation Auto variants that the current UI does not offer.

## Video: outline

All five values are numbers. Units are not specified in the UI model; the listed bounds are disconnected sample capabilities.

| UI path (`video.outline.*`) | Sample range / step | Default | Existing `GraphicsTags` | Proposed Gameplay Tag |
| --- | --- | --- | --- | --- |
| `outlineThickness` | `0–4` / `0.1` | `1` | `OUTLINE_THICKNESS=20` | `EW.Settings.Graphics.OutlineThickness` |
| `outlineCurve` | `0–1` / `0.01` | `0.5` | `OUTLINE_CURVE=21` | `EW.Settings.Graphics.OutlineCurve` |
| `highlightThicknessNear` | `0–4` / `0.1` | `1` | `HIGHLIGHT_NEAR=22` | `EW.Settings.Graphics.HighlightThicknessNear` |
| `highlightThicknessFar` | `0–4` / `0.1` | `0.5` | `HIGHLIGHT_FAR=23` | `EW.Settings.Graphics.HighlightThicknessFar` |
| `highlightBrightness` | `0–2` / `0.01` | `1` | `HIGHLIGHT_BRIGHTNESS=24` | `EW.Settings.Graphics.HighlightBrightness` |

The backend's `FGraphicsSettings` sample defaults differ for outline curve (`4`), near highlight thickness (`3`), and highlight brightness (`3`). Connected capabilities/defaults must resolve this rather than reusing the UI sample numbers.

## Video: performance and view rendering

| UI path | Type and possible values in disconnected sample | Default | Existing `GraphicsTags` | Proposed Gameplay Tag |
| --- | --- | --- | --- | --- |
| `video.performance.vSyncEnabled` | boolean, `true | false` | `true` | `VSYNC=25` | `EW.Settings.Graphics.VSync` |
| `video.performance.frameRateLimitEnabled` | boolean, `true | false` | `true` | `LIMIT_FPS=26` | `EW.Settings.Graphics.FrameRateLimitEnabled` |
| `video.performance.maxFps` | number, `1–999`, step `1` | `120` | `MAX_FPS=27` | `EW.Settings.Graphics.MaxFps` |
| `video.performance.fieldOfView` | number, `40–140`, step `1` | `90` | `FOV=28` | `EW.Settings.Graphics.FieldOfView` |
| `video.performance.renderScalePercent` | number, `20–200`, step `1` | `100` | `RENDER_SCALE=29` | `EW.Settings.Graphics.RenderScalePercent` |

`maxFps` is disabled in the UI when `frameRateLimitEnabled` is false. The backend `FClientPreferencesSettings.MaxFPS` uses `0` to disable its limit, while the UI has a separate boolean and a positive FPS value; define how those two representations map. Render scale is disabled at `100` for DLAA.

## Input: camera

| UI path | Type and possible values in disconnected sample | Default | Existing `GraphicsTags` | Proposed Gameplay Tag |
| --- | --- | --- | --- | --- |
| `input.cameraSensitivity` | number, `0.1–5`, step `0.1` | `1` | `CAMERA_SENSITIVITY=30` | `EW.Settings.Input.CameraSensitivity` |
| `input.zoomSensitivity` | number, `0.1–5`, step `0.1` | `1` | `ZOOM_SENSITIVITY=31` | `EW.Settings.Input.ZoomSensitivity` |

These input tags are currently located in the protobuf enum named `GraphicsTags`; the proposed Gameplay Tag paths place them under Input to match the UI.

## Backend work needed before connecting this window

1. Define and register the proposed tag strings, or choose another explicit string-key scheme for the `TAGGED_*` messages. Keep the `GraphicsTags` enum mapping documented if it remains in use. Decide the combo option/index encoding, including `native` and frame-generation modes.
2. Return platform-derived capabilities, current values, and defaults. Numeric ranges, available resolutions, AA methods, DLSS and frame-generation support must come from the host; sample values above are for the disconnected UI only.
3. Reconcile the stated differences: brightness scale, visibility semantics, quality ordinal offset, missing SMAA in proto, missing native/off upscaler value, optional UI refresh rate versus x/y-only resolution proto, separate FPS enable flag, and outline defaults.
4. Implement the settings responses. At present, `UEwSettingsWebSocketComponent` registers get/set routes, but get handlers send empty response payloads and set handlers answer `Settings backend unavailable`. In `ew-ui`, `ConnectedGameSettingsGateway` is an adapter interface, but no call to `configureConnectedGameSettingsGateway` was found; the disconnected gateway therefore supplies the current UI values.
5. Preserve revision/conflict handling and a confirm/revert flow for display changes when adapting the UI gateway to the protobuf request/response protocol. Those behaviors exist in the UI gateway contract but not in the inspected settings proto.
