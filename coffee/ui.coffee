# vim: set expandtab tabstop=4 shiftwidth=4:
# Norman J. Harman Jr. njharman@gmail.com


class ConsoleTab extends Ext.Panel
    constructor: ()->
        super
            title: 'Console'
            cls: 'console'
            iconCls: 'info'
            scroll: 'both'
            html: ''

    log_callback: ()->
        # "this" changes so need closure
        self = @
        (msg)->
            self.log(msg)

    log: (msg)->
        @update('<li>' + msg + '</li>' + @html)

    clear: ()->
        @update('')


class TreasureTab extends Ext.Panel
    constructor: ()->
        super
            title: 'Treasure'
            cls: 'treasure'
            iconCls: 'favorites'
            scroll: 'both'
            html: 'TODO'

class LootTab extends Ext.Panel
    constructor: ()->
        super
            title: 'Loot'
            copper: 0
            silver: 0
            gold: 0
            plat: 0
            goods: {}  # gems and jewerly and such
            cls: 'loot'
            iconCls: 'favorites'
            height: '100%'
            width: '100%'
            scroll: 'both'
            layout: { type: 'vbox', align: 'stretch' }
            defaults: { margin:'0 0 0 10 ', styleHtmlContent: true, }
            items: [
                { xtype: 'component', itemId: 'lt_coins', padding: 10, centered: true, }
                ]

    record: (mob)->
        msg = @copper + 'cp ' + @silver + 'sp ' + @gold + 'gp ' + @plat + 'pp'
        @getComponent('lt_coins').update('<h4>' + msg + '</h4>')
        rpgpad.log('"' + mob.name + '" ' + msg)
        @copper += mob.treasure.copper
        @silver += mob.treasure.silver
        @gold += mob.treasure.gold
        @plat += mob.treasure.plat


class KillTab extends Ext.Panel
    Ext.regModel 'Kill',
    fields: [
        {name: 'id'}
        {name: 'count',   type: 'int'}
        {name: 'name',    type: 'string'}
        {name: 'xp',      type: 'int'}
        ]
    proxy:
        id: 'kills'
        type: 'localstorage'

    class Thinger extends Ext.Container
        constructor: ()->
            clear_btn = new Ext.Button
                text: 'Clear List'
                margin: 5
                padding: '4 10 4 10'
                handler: (button, e)->
                    rpgpad.KillTab.empty()
            super
                height: 40
                layout: { type: 'hbox', align: 'stretch', pack: 'start', }
                items: [
                    clear_btn
                    { xtype: 'component', margin: '0 0 0 60', padding: 0, styleHtmlContent: true}
                    ]

    class KillPile extends Ext.data.Store
        constructor: (update_total)->
            super
                model: 'Kill'
                autoLoad: false
                listeners:
                    datachanged:
                        fn: (store)->
                            update_total(store.sum('xp'))

    constructor: ()->
        super
            title: 'Death Toll'
            cls: 'deathtoll'
            iconCls: 'x-icon-mask trash'
            height: '100%'
            width: '100%'
            scroll: 'vertical'
            layout: { type: 'vbox', align: 'stretch', pack: 'start', }
            items: [
                new Thinger()
                {xtype: 'list', store: null, scroll: 'vertical', disableSelection: true, loadingText: 'Loading...', itemTpl:'{count} {name}, {xp} xp', tpl: '<tpl for="."><div class="x-list-item-body">{count} {name}, {xp} xp</div></tpl>' }
                ]
        self = @
        @xp = @items.getAt(0).items.getAt(1)
        @pile = @items.getAt(1)
        @pile_store = new KillPile((xp)-> self.update_total(xp))
        @pile_store.load()
        @pile.bindStore(@pile_store)

    update_total: (xp)->
        @xp.update('<h2>'+ Math.floor(xp*1.2) + ' Monster Experience ' + xp + '</h2>')

    empty: ()->
        @pile_store.proxy.clear()
        @pile_store.load()

    record_death: (name, type, xp)->
        rpgpad.log('"' + name + '" Defeated for <b>' + xp + 'xp</b>.')
        @_upsert(type, xp)

    record_capture: (name, type, xp)->
        xp = 2 * xp
        rpgpad.log('"' + name + '" Captured for <b>' + xp + 'xp</b>.')
        @_upsert('(c)' + type, xp)

    _upsert: (name, xp)->
        record = @pile_store.findRecord('name', name)
        if record == null
            record = Ext.ModelMgr.create({count: 0, xp: 0, name: name}, 'Kill')
        record.data.count += 1
        record.data.xp += xp
        record.save()
        @pile_store.load()


class CombatTab extends Ext.Panel
    constructor: ()->
        super
            title: 'Combat'
            cls: 'combat-tab'
            iconCls: 'user'
            height: '100%'
            layout: { type: 'hbox', align: 'stretch' }
            items: [rpgpad.Combat, rpgpad.Bullpen]


namespace 'rpgpad.uiparts', (self)->
    self.CombatTab = CombatTab
    self.ConsoleTab = ConsoleTab
    self.KillTab = KillTab
    self.LootTab = LootTab
    self.TreasureTab = TreasureTab
