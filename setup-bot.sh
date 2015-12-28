#!/usr/bin/env sh

function end {
    echo ""
    read -p "Press [Enter] to close..."
    exit 0
}

function npmError {
    echo ""
    echo "NPM was not found. Please, install Node.js and NPM"
    echo "http://nodejs.org"
    echo ""

    end
}

function installError {
    echo ""
    echo "Could not install dependencies"
    echo "Try installing manually with 'npm install'"

    end
}

which npm -version >/dev/null 2>&1 || npmError

echo ""
echo "NPM is installed!"
echo "Installing dependencies (that can take a while)"

which npm install >/dev/null 2>&1 || installError

echo ""
echo "Dependencies are installed."
echo ""
echo "Now, you can start the bot."
echo "We will help you configure the basic information"
echo ""

read -p "Run the bot now? [Y/N] "
if [[ $REPLY = [yY] ]]
then
    npm start
    end
else
    end
fi