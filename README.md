# SFList JSON Editor

A visual editor for the [SFList JSON format](https://gist.github.com/kode54/a7bb01a0db3f2e996145b77f0ca510d5) — a SoundFont playlist format used with BASS MIDI.

**Live at [sflist.losno.co](https://sflist.losno.co)**

## Features

- Create, open, and save `.sflist.json` files
- Add SoundFont entries (.sf2, .sf3, .sfz) and nested .sflist.json includes
- Edit gain, MIDI channel assignments (1-48), and patch mappings per entry
- Load SF2/SF3 files to populate a searchable preset picker grouped by bank, with drums sorted to the bottom
- Live JSON preview sidebar with copy-to-clipboard
- Reorderable entry list with animated transitions
- All state persisted to localStorage (with consent gate)

## Important

The `.sflist.json` file must live in the same directory as your SoundFont files, since it references them by relative path.

## Development

```bash
npm install
npx quasar dev
```

## Build

```bash
npx quasar build
```

## License

[MIT](LICENSE) — Copyright (c) 2025 LoSnoCo / Kevin López B
