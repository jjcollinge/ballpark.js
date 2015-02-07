/**
 * Test utility functions
 */

// Dependencies
var app = require("../../app");
var util = require("../../utility");
var Node = require("../../node");

describe("calculate distance", function() {
    it("should calculate a distance of 157km", function() {
        var srcNode = new Node(0.0000, 0.0000);
        var desNode = new Node(1.0000, 1.0000);
        var distance = Math.floor(util.calculateDistanceInKm(srcNode, desNode));
        expect((distance)).toBe(157);
    });
    it("should calculate a distance of 0km", function() {
        var srcNode = new Node(0.0000, 0.0000);
        var desNode = new Node(0.0000, 0.0000);
        var distance = Math.floor(util.calculateDistanceInKm(srcNode, desNode));
        expect((distance)).toBe(0);
    });
});

describe("calculate current geo location", function() {
    it("should return my location", function() {
            var location = util.getCurrentLocation("31.205.3.227", function() {
            var lat = Math.floor(location.latitude);
            var lon = Math.floor(location.longitude);
            expect(lat).toBe(53);
            expect(lon).toBe(-1);
       });
    });
    it("should return my city", function() {
            var location = util.getCurrentLocation("31.205.3.227", function() {
            var city = location.city;
            expect(city).toBe("Sheffield");
       }) 
    });
    it("should return my country", function() {
            var location = util.getCurrentLocation("31.205.3.227", function() {
            var country = location.country_name;
            expect(city).toBe("United Kingdom");
       }) 
    });
})