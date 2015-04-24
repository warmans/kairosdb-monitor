KairosDB Monitor
================================

Dashboard for monitoring a KairosDB cluster.

## Requirements

* NodeJS
* NPM
* Grunt CLI (dev only)
* Bower (dev only)

## Installing

1. Clone source to desired location. 
2. `npm install --production`
3. Copy `config/config.example.js` to `config/config.js`
4. Add hosts to `config/config.js`

## Running

1. From the project root run `./kairos-monitor start`
2. Optionally run `./kairos-monitor status` to confirm the application is running correctly
3. Optionally `tail -f log/app.log` to see what the application is doing
4. Optionally stop the application using `./kairos-monitor stop` 

(note linking the kairos-monitor script to /etc/init.d does not work currently)

## Developing

Dist versions of front-end dependencies are included by default. Altering these dependencies (or updating the CSS) 
requires some additional setup:

1. Install dev dependencies `npm install`
2. Install front end dependencies `bower install`
3. Now you should be able to rebuild vendor.css, vendor.js and style.css by running `grunt`

The angular application is not compiled so you can change it without re-building anything.

                                                  ____
       ___                                      .-~. /_"-._
      `-._~-.                                  / /_ "~o\  :Y
          \  \                                / : \~x.  ` ')
           ]  Y                              /  |  Y< ~-.__j
          /   !                        _.--~T : l  l<  /.-~
         /   /                 ____.--~ .   ` l /~\ \<|Y
        /   /             .-~~"        /| .    ',-~\ \L|
       /   /             /     .^   \ Y~Y \.^>/l_   "--'
      /   Y           .-"(  .  l__  j_j l_/ /~_.-~    .
     Y    l          /    \  )    ~~~." / `/"~ / \.__/l_
     |     \     _.-"      ~-{__     l  :  l._Z~-.___.--~
     |      ~---~           /   ~~"---\_  ' __[>
     l  .                _.^   ___     _>-y~
      \  \     .      .-~   .-~   ~>--"  /
       \  ~---"            /     ./  _.-'
        "-.,_____.,_  _.--~\     _.-~
                    ~~     (   _}       -Row
                           `. ~(
                             )  \
                            /,`--'~\--'~\
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                             ->T-Rex<-
