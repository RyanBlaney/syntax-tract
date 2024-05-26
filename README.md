# syntax-tract README

## Features

This plugin allows you to replace unnecessary words or phrases with symbols inside of your editor, without losing the functionality of the code. The plugin advocates for **readability** and puts the configuration in the hands of the users. Any word or phrase can be converted into a symbol or left blank to abstract away excess bloat and allows your eyes to focus on the important parts of the code. 

## Installation

You can either install the extension through the VSCode Marketplace, or you can install the syntax-tract/syntax-tract-0.0.3.vsix file by clicking 'Install from VSIX'.

## Requirements

There are no important requirements, other than that you understand json formatting.

## Extension Settings

Configuring the extension is very straightforward. First, open your ```settings.json``` file for this extension.  
Then you can add languages, using this C++ config as an example. The left side of each word is what gets 
replaced, and the right side is the symbol to replace it with. This could be left blank. Notice for escape 
characters, '\',  I'm using a double '\\' for the new line.  

```json
"syntaxTract.languages": {
    "cpp": {
        "words": {
            "std::": "⊇",
                "\\n": "⏎",
                "(int)": "⚙",
                "(unsigned int)": "⚙",
                "(char)": "⚙",
                "(float)": "⚙",
                "(double)": "⚙",
                "(long long)": "⚙",
                "(unsigned long long)": "⚙",
                "(short)": "⚙",
                "(unsigned short)": "⚙",
                "(long)": "⚙",
                "(unsigned long)": "⚙",
                "(bool)": "⚙",
                "(wchar_t)": "⚙",
                "(unsigned char)": "⚙",
                "(signed char)": "⚙",
                "(void*)": "⚙",
                "(size_t)": "⚙",
                "(ptrdiff_t)": "⚙",
                "(intptr_t)": "⚙",
                "(uintptr_t)": "⚙",
                "(std::string)": "⚙",
                "(std::wstring)": "⚙",
                "static_cast<int>": "⚙",
                "static_cast<unsigned int>": "⚙",
                "static_cast<char>": "⚙",
                "static_cast<float>": "⚙",
                "static_cast<double>": "⚙",
                "static_cast<long long>": "⚙",
                "static_cast<unsigned long long>": "⚙",
                "static_cast<short>": "⚙",
                "static_cast<unsigned short>": "⚙",
                "static_cast<long>": "⚙",
                "static_cast<unsigned long>": "⚙",
                "static_cast<bool>": "⚙",
                "static_cast<wchar_t>": "⚙",
                "static_cast<unsigned char>": "⚙",
                "static_cast<signed char>": "⚙",
                "static_cast<void*>": "⚙",
                "static_cast<size_t>": "⚙",
                "static_cast<ptrdiff_t>": "⚙",
                "static_cast<intptr_t>": "⚙",
                "static_cast<uintptr_t>": "⚙",
                "static_cast<std::string>": "⚙",
                "static_cast<std::wstring>": "⚙"
        },
        "color": "#ff8a8a"
        "hideBraces:" true -- this is to hide {} when you are outside of the scope 
    },
    -- Add languages/file-types here  
},
```

## Release Notes

### 0.0.3 - Initial release. Has basic features, with very minimal presets. Only C++ is preconfigured so far.
