## standard step to add a phyobj:
```js
// ParticlePhyObject:  (world, mass, pos, velocity)
var particle1 = new ParticlePhyObject(world, "2*5", [0, 0], [0, 0]);
// RigidBodyPhyObject: (world, radius, mass, pos, velocity)
var rigidbody1 = new RigidbodyPhyObject(world, 2, 4, [5, 5], [0, 0]);
```

## standard step to add a variable for a phyobj:
```js
// Variable:   (name, val, type)
var variable1 = new Variable("var_name", "VAR_123456789 + 2", "derived");
SOME_PO.vars.push(world.add_var(variable1));    // standard step

var variable2 = new Variable("var_name", 3.7, "immediate");
SOME_PO.vars.push(world.add_var(variable2));    // standard step
```
`type` has two choice: `immediate` or `derived`. 
for `immediate`, it is common to be a number / vector (array), the system will treat is as a constant variable.
for `derived`, it MUST be a string of expression that tells the system how to calculate it on real-time. 
If you want to use other variable, use their 9-digit-id DYNAMICALLY, (e.g. `VAR_${variable2.id}`, or, if you know the exact id in current session, "VAR_123456789" ) since the id of variable & po are changing everytime.

You can use standard math.js type of writing a expression, since we use math.js for calculating.

## standard step to add a forcefield:
The force field has no belongings, so if we call it "regist on some po", it just means where the user can find the ff. there is NO logical relation between the ff and the po, its just some convenience for user's operation. Usually, we will regist a ff on a po if the physical meaning of the ff has some relation to that po. but remember, in calculation, the ff and po are independent, and DO NOT ASSUME there are any relation between them!

