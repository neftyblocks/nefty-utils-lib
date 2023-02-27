# use

### ⚡️ Under heavy development. Pin your NPM version!!!! before consumption. ⚡️

## Installation

```bash
pnpm install @nefty/use
```

```bash
yarn add @nefty/use
```

## Usage

```js
import { ... } from '@nefty/use';
```

see [lib/README.md](lib/README.md) for all methodes

# 💻 Development

-   Clone this repository
-   Run `pnpm install` to install dependencies
-   Run `pnpm build` to build the library and rebuild after a change, I don't have a nice setup for this yet
-   Run `pnpm dev` to start the development server

# 📦 Publishing

-   Commit all changes (no need to push)
-   Run `pnpm pub` to publish the package

# I like pnpm just not the command (let's rename to `P`)

1. Open the `~/.zshrc` file in your preferred text editor.

2. Next, add your alias to the end of the file, save the changes and close the editor.

```bash
alias p='pnpm'
```

3. Run the below source command, which does not provide output, but sources the `~/.zshrc` file to make the alias available in your current shell. `source ~/.zshrc`

```bash
source ~/.zshrc
```

4. Now you can use the alias to run the command.

```bash
p dev
```
