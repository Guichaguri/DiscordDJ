@echo off

call npm -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto init

echo.
echo NPM was not found. Please, install Node.js and NPM
echo http://nodejs.org
echo.

goto end

:init

echo.
echo NPM is installed!
echo Installing dependencies (that can take a while)
call npm install >NUL 2>&1
if not "%ERRORLEVEL%" == "0" goto installError

echo.
echo Dependencies are installed.
echo.
echo Now, you can start the bot.
echo We will help you configure the basic information
echo.

set /P c=Run the bot now? [Y/N]
if /I "%c%" EQU "Y" goto run
goto end

:run

npm start
goto end

:installError

echo.
echo Could not install dependencies
echo Try installing manually with 'npm install'

goto end

:end

echo.
pause;
exit;