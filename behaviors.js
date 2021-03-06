// # behaviors

//fast sine approximation, only valid between -pi and pi
function fastSin(angle)
{
	var B = 4 / PI;
	var C = -4 / (PI*PI);

	return -(B * angle + C *angle * ((angle < 0) ? -angle : angle));
} 

// basic stuff
const WillMove = (self) => ({
	move: () => {
		self.velocity.add(self.acceleration);
		if (self.maxVelocity > 0) {
			self.velocity.limit(self.maxVelocity);
		}
		self.location.add(self.velocity);
		self.acceleration.mult(0);
	}
});

const WillReact = (self) => ({
	reactTo: (force) => {
		self.acceleration.add(force);
	}
});

const WillBounceOnEdges = (self, xLimit, yLimit) => ({
	bounce: () => {
		let loss = 0.8;
		if (self.location.x < 0) {
			self.velocity.x = -self.velocity.x*loss;
			self.location.x = 0;
			return true;
		}
		if (self.location.x > xLimit) {
			self.velocity.x = -self.velocity.x*loss;
			self.location.x = xLimit;
			return true;
		}
		if (self.location.y < 0) {
			self.velocity.y = -self.velocity.y*loss;
			self.location.y = 0;
			return true;
		}
		if (self.location.y > yLimit) {
			self.velocity.y = -self.velocity.y*loss;
			self.location.y = yLimit;
			return true;
		}
		return false;
	}
});

const WillGoAroundEdges = (self, xLimit, yLimit) => ({
	bounce: () => {
		if (self.location.x < 0) {
			self.location.x = xLimit;
			return true;
		}
		if (self.location.x > xLimit) {
			self.location.x = 0;
			return true;
		}
		if (self.location.y < 0) {
			self.location.y = yLimit;
			return true;
		}  
		if (self.location.y > yLimit) {
			self.location.y = 0;
			return true;
		}	
		return false;
	}
});

// pulser stuff
const WillHavePulsersAttached = (self, pulsersQty) => ({
	pulse: () => {
		if (self.pulsers == null || self.pulsers.length == 0) {
			self.pulsers = [];
			for (let i = 0; i < pulsersQty; i++) {
				self.pulsers[i] = Pulser(self.size/2*(pulsersQty-1), self, 100, 10, 0.00008, self.color, i);
			}
		}
		
		push();
		translate(self.location.x, self.location.y);
		for (let i = 0; i < self.pulsers.length; i++) {
			self.pulsers[i].grow();
			self.pulsers[i].show();
		}
		pop();
	}
});

const WillPulse = (self, speed) => ({
	grow: () => {
		let pR = self.radius - (self.anchor.size/2*self.index);
		if (pR <= self.maxRadius) { 
			self.radius += speed + self.anchor.velocity.mag(); // keep growing based on anchor's velocity
		} else {
			self.radius = (self.index-1)*self.anchor.size/2; // starts again, -radius
		}
	},
	show: (where) => {

		if (where == null) {
			where = this;
		}	
		//where.push();
		//where.translate(self.anchor.location.x, self.anchor.location.y);
		//where.noFill();
		where.stroke(self.color);
		where.beginShape();

		var numVertex = Math.ceil(400 / beaters.length);

		//for (var a = 0; a < TWO_PI-TWO_PI/self.vertex; a += TWO_PI/self.vertex) {
		for (var a = -PI; a < PI; a += TWO_PI/numVertex) {

			var cosAngle = (a + (PI/2)); 
		    if (cosAngle > PI) cosAngle -= TWO_PI;

			var _noise = noise(fastSin(cosAngle) + 1, fastSin(a) + 1, self.offSet); //noise(cos(a) + 1, sin(a) + 1, self.offSet);
			var _offset = map(_noise, 0, 1, -self.radius/self.noiseRange, self.radius/self.noiseRange);
			var _radius = self.radius - (self.anchor.size/2*self.index) + _offset;
			if (_radius > 0) {
				where.vertex(_radius*fastSin(cosAngle), _radius*fastSin(a));
				self.offSet += self.offSetProgression;
			}	
		}
		where.endShape(CLOSE);
		//where.pop();		
	}
})

// shape stuff
const Ellipse = (self, c) => ({
	show: () => {
		push();
		if (c != null) {
			fill(c);
			//stroke(c);
		} 
		ellipseMode(CENTER);
		ellipse(self.location.x, self.location.y, self.size, self.size)
		pop();
	}
});

const Rectangle = (self) => ({
	show: () => {
		push();
		noStroke();
		rectMode(CENTER);
		rect(self.location.x, self.location.y, self.size, self.size)
	    pop();
	}
});

// behaviors sets
const Particle = (self) => 	Object.assign({},WillMove(self),WillReact(self));