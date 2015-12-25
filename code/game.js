var global_game = null;
var file = "a";
$(function() { 
	start_game();
});
var global_letter = null;
function start_game()
{
	var g = new game();
	
	global_game = g;
	
	$(window).resize(function() {
		g.resize();
	});
	
	g.start();
	
}

function delete_letter(){
	if(global_letter != null){
		if(global_letter.body == null)
		{
			return;
		}
		global_letter.body.GetWorld().DestroyBody( global_letter.body );
		global_letter.body = null;
		global_letter.dead = true;
	}
}

function random_letter()
{
	if(global_letter != null){
		if(global_letter.body != null)
		{
			return;
		}
	}
	var code = Math.round(65 + Math.random() * (90 - 65));
	console.log(code);
	var xc = 0.5;
	switch(code){
		case 81:
			file = "q";
			xc = 0.1;
			break;
		case 87:
			file = "w";
			xc = 0.1 + (0.0755555 * 1);
			break;
		case 69:
			file = "e";
			xc = 0.1 + (0.0755555 * 2);
			break;
		case 82:
			file = "r";
			xc = 0.1 + (0.0755555 * 3);
			break;
		case 84:
			file = "t";
			xc = 0.1 + (0.0755555 * 4);
			break;
		case 89:
			file = "y";
			xc = 0.1 + (0.0755555 * 5);
			break;
		case 85:
			file = "u";
			xc = 0.1 + (0.0755555 * 6);
			break;
		case 73:
			file = "i";
			xc = 0.1 + (0.0755555 * 7);
			break;
		case 79:
			file = "o";
			xc = 0.1 + (0.0755555 * 8);
			break;
		case 80:
			file = "p";
			xc = 0.78;
			break;
		case 65:
			file = "a";
			xc = 0.13;
			break;
		case 83:
			file = "s";
			xc = 0.13 + (0.0755555 * 1);
			break;
		case 68:
			file = "d";
			xc = 0.13 + (0.0755555 * 2);
			break;
		case 70:
			file = "f";
			xc = 0.13 + (0.0755555 * 3);
			break;
		case 71:
			file = "g";
			xc = 0.13 + (0.0755555 * 4);
			break;
		case 72:
			file = "h";
			xc = 0.13 + (0.0755555 * 5);
			break;
		case 74:
			file = "j";
			xc = 0.13 + (0.0755555 * 6);
			break;
		case 75:
			file = "k";
			xc = 0.13 + (0.0755555 * 7);
			break;
		case 76:
			file = "l";
			xc = 0.13 + (0.0755555 * 8);
			break;
		case 90:
			file = "z";
			xc = 0.16;
			break;
		case 88:
			file = "x";
			xc = 0.16 + (0.0755555 * 1);
			break;
		case 67:
			file = "c";
			xc = 0.16 + (0.0755555 * 2);
			break;
		case 86:
			file = "v";
			xc = 0.16 + (0.0755555 * 3);
			break;
		case 66:
			file = "b";
			xc = 0.16 + (0.0755555 * 4);
			break;
		case 78:
			file = "n";
			xc = 0.16 + (0.0755555 * 5);
			break;
		case 77:
			file = "m";
			xc = 0.16 + (0.0755555 * 6);
			break;
		default:
			xc = Math.random();
			file = "circle";
			break;
	}
	global_letter = new letter({x : xc * global_game.screen_width, y: global_game.screen_height-1.5 , game : global_game, f:file});
	global_game.game_objects.push(global_letter);
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

	this.setup_collision_handler();
	random_letter()
}

game.prototype.create_box2d_world = function()
{
	var gravity = new b2Vec2(0, -3);

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
	var xc = 0.5;
	switch(code){
		case 81:
			file = "q";
			xc = 0.1;
			break;
		case 87:
			file = "w";
			xc = 0.1 + (0.0755555 * 1);
			break;
		case 69:
			file = "e";
			xc = 0.1 + (0.0755555 * 2);
			break;
		case 82:
			file = "r";
			xc = 0.1 + (0.0755555 * 3);
			break;
		case 84:
			file = "t";
			xc = 0.1 + (0.0755555 * 4);
			break;
		case 89:
			file = "y";
			xc = 0.1 + (0.0755555 * 5);
			break;
		case 85:
			file = "u";
			xc = 0.1 + (0.0755555 * 6);
			break;
		case 73:
			file = "i";
			xc = 0.1 + (0.0755555 * 7);
			break;
		case 79:
			file = "o";
			xc = 0.1 + (0.0755555 * 8);
			break;
		case 80:
			file = "p";
			xc = 0.78;
			break;
		case 65:
			file = "a";
			xc = 0.13;
			break;
		case 83:
			file = "s";
			xc = 0.13 + (0.0755555 * 1);
			break;
		case 68:
			file = "d";
			xc = 0.13 + (0.0755555 * 2);
			break;
		case 70:
			file = "f";
			xc = 0.13 + (0.0755555 * 3);
			break;
		case 71:
			file = "g";
			xc = 0.13 + (0.0755555 * 4);
			break;
		case 72:
			file = "h";
			xc = 0.13 + (0.0755555 * 5);
			break;
		case 74:
			file = "j";
			xc = 0.13 + (0.0755555 * 6);
			break;
		case 75:
			file = "k";
			xc = 0.13 + (0.0755555 * 7);
			break;
		case 76:
			file = "l";
			xc = 0.13 + (0.0755555 * 8);
			break;
		case 90:
			file = "z";
			xc = 0.16;
			break;
		case 88:
			file = "x";
			xc = 0.16 + (0.0755555 * 1);
			break;
		case 67:
			file = "c";
			xc = 0.16 + (0.0755555 * 2);
			break;
		case 86:
			file = "v";
			xc = 0.16 + (0.0755555 * 3);
			break;
		case 66:
			file = "b";
			xc = 0.16 + (0.0755555 * 4);
			break;
		case 78:
			file = "n";
			xc = 0.16 + (0.0755555 * 5);
			break;
		case 77:
			file = "m";
			xc = 0.16 + (0.0755555 * 6);
			break;
		default:
			xc = Math.random();
			file = "circle";
			break;
	}
	this.game_objects.push(new player({x : xc * this.screen_width, y: 0 , game : this, f:file}));
}

game.prototype.setup_collision_handler = function()
{
	var that = this;
	b2ContactListener.prototype.BeginContact = function (contact) 
	{
		var a = contact.GetFixtureA().GetUserData();
		var b = contact.GetFixtureB().GetUserData();
		
		if(a instanceof player && b instanceof letter)
		{
			delete_letter();
		}
		
		else if(b instanceof player && a instanceof letter)
		{
			delete_letter();
		}
	}
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
	this.f = options.f;
	this.game = options.game;
	this.age = 0;
		
	this.do_move_left = false;
	this.do_move_right = false;
	this.max_hor_vel = 2;
	this,max_ver_vel = 4;
	this.can_move_up = true;

	
	var info = { 
		'density' : 10 ,
		'fixedRotation' : false ,
		'userData' : this ,
		'type' : b2Body.b2_dynamicBody ,
		'restitution' : 0.6 ,
	};
	
	var body = create_box(this.game.box2d_world , this.x, this.y, this.width, this.height, info);
	this.body = body;


	this.add_velocity(new b2Vec2(0,7));
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
	
	if(this.body.GetPosition().y < 0)
	{
		this.game.destroy_object(this);
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
	this.game.ctx.drawImage(img_res(this.f+'.png') , -width / 2, -height / 2, width, height);
	this.game.ctx.translate(-sx, -sy);
}

player.prototype.destroy = function()
{
	if(this.body == null)
	{
		return;
	}
	this.body.GetWorld().DestroyBody( this.body );
	this.body = null;
	this.dead = true;
	random_letter();
}

function letter(options)
{
	this.height = 1.0;
	this.width = 1.0;
	
	this.x = options.x;
	this.y = options.y;
	this.f = options.f;
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
		'type' : b2Body.b2_staticBody,
		'restitution' : 0.6 ,
	};
	
	var body = create_box(this.game.box2d_world , this.x, this.y, this.width, this.height, info);
	this.body = body;
}

letter.prototype.tick = function()
{
	this.age++;
}

letter.prototype.draw = function()
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
	this.game.ctx.drawImage(img_res(this.f+'.png') , -width / 2, -height / 2, width, height);
	this.game.ctx.translate(-sx, -sy);
}

letter.prototype.destroy = function()
{
	if(this.body == null)
	{
		return;
	}
	this.body.GetWorld().DestroyBody( this.body );
	this.body = null;
	this.dead = true;
}