# Spectacle Editor

An [Electron](https://github.com/electron/electron) based app for creating, editing, saving, and publishing [Spectacle](https://github.com/FormidableLabs/spectacle) presentations. With integrated [Plotly](https://plot.ly) support.

This project is a joint effort between [Formidable](http://formidable.com) and [Plotly](https://plot.ly).

## Getting started with development

Please review the [contributing guidelines](https://github.com/FormidableLabs/spectacle-editor/blob/master/CONTRIBUTING.md) first.

Fork then clone the repo:

```
git clone git@github.com:<USERNAME>/spectacle-editor.git
```

Install npm dependencies:

```
cd spectacle-editor && npm install
```

Run Spectacle Editor in dev mode:

```
npm run dev
```

Running tests/lint:

```
npm run check
```

## Overview

The initial setup of this project is based on [electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate).

[MobX](https://mobxjs.github.io/mobx) and [seamless-immutable](https://github.com/rtfeldman/seamless-immutable) are used for the store(s).

Note: Instead of actions, components call methods on the store(s) passed down via context.

Spectacle Editor leverages [React-Motion](https://github.com/chenglou/react-motion) for drag and drop functionality.

### Draggable elements

The elements that can be added to slides and edited include:

* Text
* Image
* Plotly chart
* Table
* Shape (V2)
* MathJax (V2)

Each element will have a corresponding property menu that is available when an element of that type is selected.

### Canvas

The canvas is the editable area that displays the current slide. Elements can be dropped on the canvas, repositioned and formatted.

### Slide list

The slide list displays all slides in the presentation and allows for changing the selected slide and reordering existing slides.

### Property menu

This is where options for the selected element will appear. The menu will depend on the type of element selected. If no element is selected a slide menu will appear.

## Creating release packages

To build for Windows on MacOS, you'll need (this may take 30+ mins):

```bash
brew update
```

```bash
brew install wine --without-x11
brew install mono
```

To build for Linux on MacOS, you'll need:
```bash
brew install gnu-tar libicns graphicsmagick xz
```

To build and package for all platforms, run:
```bash
npm run release
```

Other packaging steps are:
```
npm run package-all
npm run package-mac
npm run package-win
npm run package-linux
```
