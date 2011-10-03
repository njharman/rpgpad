About
=====
*Super beta, draft, ugly, etc.*
iPad app to help me run OSRIC_ pen & paper role-playing games.


Requirements & Install
======================
It's a web app. Point iPad at web server serving up this code.

Expects `Sencha Touch`__ css/js files to be added::

    c/sencha-touch.css
    j/sencha-touch.js

__ http://www.sencha.com/products/touch/


TODO
====

    - BUG Spells casted are per type not per instance
    - More Refactor buttugly code/structure into something not so embarrasing.
    - Better/complete offline storage, offline work.
    - Distinguish betwen AC and nodex/noshield AC.
    - Temp tohit/damage/save mods, (like from bless)
    - Upload data to server/email.
    - Add loot to monsters.
    - Record Loot.
    - Monster manual, spells import from url.
    - Local storage of unique monsters' state.
    - Treasure generation.
    - Random encounters.
    - Magic Resistance.
    - "Encounter" & "rooms". Group of monsters and loot together.
    - Finish and integrate my Tablesmith_ table processing js lib.
    - Improve performance of action screen.
    - Time tracking.
    - Make "rules system" modular so can make |LL|_ and |SW|_ modules.
    - Permanent server to host app, data, etc.


PIE IN THE SKY
--------------

    - Integrated, interactive dungeon / wilderness maps.
    - Worry about users other than me.
    - Rewrite without Sencha Touch.

.. _osric: http://en.wikipedia.org/wiki/OSRIC
.. _tablesmith: http://mythosa.net/wiki/pmwiki.php?n=Main.TableSmith
.. |SW| replace:: Swords & Wizardry
.. _sw: http://www.swordsandwizardry.com/
.. |LL| replace:: Labyrinth Lord
.. _ll: http://www.goblinoidgames.com/labyrinthlord.html
