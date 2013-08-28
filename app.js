var app = app || {};

// Model
app.Todo = Backbone.Model.extend({
    defaults: {
        title: '',
        done: false
    },
    
    toggle: function() {
        this.save({
            done: !this.get('done')
        });
    }
});

// Collection
var TodoList = Backbone.Collection.extend({
    model: app.Todo,
    
    url: '/',

    nextOrder: function() {
        if ( !this.length ) {
            return 1;
        }
        return this.last().get('order') + 1;
    },
    
    comparator: function( todo ) {
        return todo.get('order');
    }
});

app.Todos = new TodoList();

// App View ( Whole Todo List )
app.AppView = Backbone.View.extend({
    el: '#app',
    
    events: {
        'keypress #new': 'createOnEnter'
    },
    
    initialize: function() {
        this.$input = this.$('#new');
        this.$main = this.$('#main');
        
        this.listenTo(app.Todos, 'add', this.addOne);
    },
    
    render: function() {
        if ( app.Todos.length ) {
            this.$main.show();
        } else {
            this.$main.hide();
        }
    },
    
    addOne: function( todo ) {
        var view = new app.TodoView({ model: todo });
        $('#list').append( view.render().el );
    },
    
    newAttributes: function() {
        return {
            title: this.$input.val().trim(),
            order: app.Todos.nextOrder(),
            done: false
        };
    },
    
    createOnEnter: function( event ) {
        if ( event.which !== 13 ||
                !this.$input.val().trim() ) {
            return;
        }
    
        app.Todos.create( this.newAttributes() );
        this.$input.val('');
    }

});

// Item View ( Each Task )
app.TodoView = Backbone.View.extend({
    tagName: 'li',
    
    events: {
    'click .toggle': 'toggleDone',
    'click .destory': 'clear'
    },
    
    template: _.template( $('#item-template').html() ),

    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function() {
        this.$el.html( this.template( this.model.toJSON() ) );
        
        this.$el.toggleClass( 'done', this.model.get('done') );
        
        return this;
    },
    
    toggleDone: function() {
        this.model.toggle();
    },
    
    clear: function() {
        this.model.destroy();
    }
});