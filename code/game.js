var global_game = null;

$(function() { 
	start_game();
});

function start_game()
{
	var g = new game();
	
	global_game = g;
	
	$(window).resize(function() {
		g.resize();
	});
	
	g.start();
}

function game()
{
	this.fps = 60;
	this.scale = 50;
	
	this.game_objects = [];
	
	this.to_destroy = [];
	this.time_elapsed = 0;
}

game.prototype.resize = function()
{
	var canvas = this.canvas;
	
	var w = $(window).outerWidth();
	var h = $(window).outerHeight();
	
	canvas.width(w);
	canvas.height(h);
	
	canvas.attr('width' , w * 0.75);
	canvas.attr('height' , h * 0.75);
	
	this.canvas_width = canvas.attr('width');
	this.canvas_height = canvas.attr('height');
	
	this.screen_height = 10;
	this.scale = this.canvas_height / this.screen_height;
	this.screen_width = this.canvas_width / this.scale;
}

game.prototype.setup = function()
{
	this.ctx = ctx = $('#canvas').get(0).getContext('2d');
	var canvas = $('#canvas');
	this.canvas = canvas;
	
	this.resize();
	
	var w = this.screen_width;
	var h = this.screen_height;
		
	this.create_box2d_world();

	this.start_handling();
}

game.prototype.create_box2d_world = function()
{
	var gravity = new b2Vec2(0, -10);

	var doSleep = false;
	var world = new b2World(gravity , doSleep);

	this.box2d_world = world;
}

game.prototype.start = function()
{
	this.on = true;
	
	this.setup();
	this.is_paused = false;

	this.tick();
}

game.prototype.redraw_world = function()
{
	this.ctx.clearRect(0 , 0 , this.canvas_width , this.canvas_height);

	var w = this.screen_width;
	var h = this.screen_height;
	for(var i in this.game_objects)
	{
		this.game_objects[i].draw();
	}
}

game.prototype.tick = function(cnt)
{
	if(!this.is_paused && this.on)
	{
		this.time_elapsed += 1;

		for(var i in this.game_objects)
		{
			if(this.game_objects[i].dead == true)
			{
				delete this.game_objects[i];
				continue;
			}
			
			this.game_objects[i].tick();
		}

		this.perform_destroy();

		this.box2d_world.Step(1/20 , 8 , 3);

		this.box2d_world.ClearForces();

		this.redraw_world();
		
		if(!this.is_paused && this.on)
		{
			var that = this;
			this.timer = setTimeout( function() { that.tick(); }  , 1000/this.fps);
		}
	}
}

game.prototype.perform_destroy = function()
{
	for(var i in this.to_destroy)
	{
		this.to_destroy[i].destroy();
	}
}

game.prototype.get_offset = function(vector)
{
	return new b2Vec2(vector.x - 0, Math.abs(vector.y - this.screen_height));
}

game.prototype.start_handling = function()
{
	var that = this;
	
	$(document).on('keydown.game' , function(e)
	{
		that.key_down(e);
		return false;
	});
}

game.prototype.key_down = function(e)
{
	var code = e.keyCode;
	var xc = Math.random() * this.screen_width;
	this.game_objects.push(new player({x : xc, y: 0 , game : this}));
}


game.prototype.destroy_object = function(obj)
{
	this.to_destroy.push(obj);
}
function player(options)
{
	this.height = 1.0;
	this.width = 1.0;
	
	this.x = options.x;
	this.y = options.y;
	this.game = options.game;
	this.age = 0;
		
	this.do_move_left = false;
	this.do_move_right = false;
	this.max_hor_vel = 2;
	this,max_ver_vel = 4;
	this.can_move_up = true;

	
	var info = { 
		'density' : 10 ,
		'fixedRotation' : true ,
		'userData' : this ,
		'type' : b2Body.b2_dynamicBody ,
		'restitution' : 0.6 ,
	};
	
	var body = create_box(this.game.box2d_world , this.x, this.y, this.width, this.height, info);
	this.body = body;


	this.add_velocity(new b2Vec2(0,13));
}

player.prototype.tick = function()
{
	if(this.do_move_left)
	{
		this.add_velocity(new b2Vec2(-1,0));
	}
	
	if(this.do_move_right)
	{
		this.add_velocity(new b2Vec2(1,0));
	}
	
	if(this.do_move_up && this.can_move_up)
	{
		
		this.add_velocity(new b2Vec2(0,6));
		this.can_move_up = false;
	}
	
	this.age++;
}

player.prototype.add_velocity = function(vel)
{
	var b = this.body;
	var v = b.GetLinearVelocity();
	
	v.Add(vel);
	
	if(Math.abs(v.y) > this.max_ver_vel)
	{
		v.y = this.max_ver_vel * v.y/Math.abs(v.y);
	}
	
	if(Math.abs(v.x) > this.max_hor_vel)
	{
		v.x = this.max_hor_vel * v.x/Math.abs(v.x);
	}
	b.SetLinearVelocity(v);
}

player.img = img_res('circle.png');

player.prototype.draw = function()
{
	if(this.body == null)
	{
		return false;
	}
	
	var c = this.game.get_offset(this.body.GetPosition());
	
	var scale = this.game.scale;
	
	var sx = c.x * scale;
	var sy = c.y * scale;
	
	var width = this.width * scale;
	var height = this.height * scale;
	
	this.game.ctx.translate(sx, sy);
	this.game.ctx.drawImage(player.img , -width / 2, -height / 2, width, height);
	this.game.ctx.translate(-sx, -sy);
}