Array.prototype.indexOf = function(target){
	for(i=this.length; i>-1; i--){
		if(this[i] == target){
			return i;
		}
	}
	return -1;
}


DFretboard = Ember.Application.create({
	ready: function(){
		var fretboard = DFretboard.Fretboard;
		fretboard.configure({tuning: ["E", "A", "D", "G", "B", "E"], length: 1800});
	}
});


DFretboard.NoteCircle = Ember.Object.create({
	notes: ["E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B", "C", "C#/Db", "D", "D#/Eb"],
	sharpenNote: function(note, times){
		var notes = this.get("notes");
		var i = notes.indexOf(note);
		return notes[(i + times) % notes.length];
	}


});


DFretboard.Chord = Ember.Object.extend({
	name: "Chord",
	offsets: null,
	root: null
});


DFretboard.ChordTypes = Ember.Object.create({
	single: DFretboard.Chord.create({
		name: "Single",
		offsets: [0]
	}),

	majorTriad: DFretboard.Chord.create({
		name: "Major Triad",
		offsets: [0, 4, 7]
	}),

	minorTriad: DFretboard.Chord.create({
		name: "Minor Triad",
		offsets: [0, 3, 7]
	}),

	augmentedTriad: DFretboard.Chord.create({
		name: "Augmented Triad",
		offsets: [0, 4, 8]
	})
});


DFretboard.Fret = Ember.Object.extend({
	note: null,
	length: 0
});


DFretboard.String = Ember.ArrayProxy.extend({
	content: null,
	root: "E",
	numFrets: 22,
	fretLengths: null,

	initFrets: function(){
		var root = this.get("root");
		var numFrets = this.get("numFrets");
		var fretLengths = this.get("fretLengths");
		var i;
		for(i=0; i<=numFrets; i++){
			var note = DFretboard.NoteCircle.sharpenNote(root, i);
			var fret = DFretboard.Fret.create({
				note: note, 
				length: fretLengths[i]
			});
			this.addObject(fret);
		}
	}
});


DFretboard.Fretboard = Ember.ArrayProxy.create({
	content: [],
	k: 1.0594631, //Constant used for guitar math (fret distances)
	numFrets: 22,
	fretIndices: function(){
		var i, numFrets = this.get("numFrets");
		var buff = [];
		for(i=0; i<=numFrets; i++){
			buff.push(i);
		}
		return buff;
	}.property("numFrets"),

	boardLength: 1800,

	getFretLengths: function(){
		var numFrets = this.get("numFrets");
		var k = this.get("k");
		var boardLength = this.get("boardLength");

		var fretDistancesFromBridge = [];
		var fretLengths = [20]; //The 0 index fret isn't a fret, but the nut.  Fixed width okay.

		var i;

		//numFrets refers to actual frets, so 0 index (open note) doesn't count
		//Use <= numFrets
		for(i=0; i<=numFrets+1; i++){
			fretDistancesFromBridge[i] = boardLength/Math.pow(k, i);
		}

		for(i=1; i<=numFrets; i++){ //Skip 0
			fretLengths[i] = fretDistancesFromBridge[i] - fretDistancesFromBridge[i+1];
		}
		return fretLengths;
	},

	configure: function(options){
		var tuning = options.tuning;
		var i, len = tuning.length;
		var numFrets = this.get("numFrets");

		var fretLengths = this.getFretLengths();
		for(i=0; i<len; i++){
			var root = tuning[i];
			console.log("adding a string with root " + root);
			var string = DFretboard.String.create({
				content: [], 
				root: root, 
				numFrets: numFrets, 
				fretLengths: fretLengths
			});
			string.initFrets();
			this.addObject(string);
		}
	}

});
