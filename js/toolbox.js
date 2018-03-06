$(document).ready(function($) {
  //populate fixed dropdowns
  var i = 11;
  while (++i < 20) {
    $("#wheelsize").append($("<option />").val(i).text(i + " Inch"));
  }
  i = 7;
  while (++i < 17) {
    $("#tirewidth").append($("<option />").val((i * 0.25).toFixed(2)).text((i * 0.25).toFixed(2) + " Inch"));
  }
  i = 1;
  while (++i < 11) {
    $("#ratio").append($("<option />").val((i * 10).toFixed(2)).text((i * 10).toFixed(2) + " : 1"));
  }
  i = 37;
  $("#pistonselect").append($("<option />").text('Please Select A Piston Diameter'));
  while (++i < 52) {
    $("#pistonselect").append($("<option />").val(i).text((i) + "mm"));
  }
  //Page Navigation
  $("#portduration").click(function() {
    $("#index").hide();
    $("#page5").show();
    $("#pdcrod").val("90");
    $("#pdstroke").val("");
    $("#pdheight").val("");
  });
  $("#mixgas").click(function() {
    $("#index").hide();
    $("#page3").show();
    $("#ratio").val("50.00");
    $("#gas").val("");
    $("#oilamount").val("");
  });
  $("#calcgearing").click(function() {
    $("#index").hide();
    $("#page1").show();
  });
  $("#carbsize").click(function() {
    $("#index").hide();
    $("#page4").show();
  });
  $("#p1prev").click(function() {
    $("#index").show();
    $("#page1").hide();
  });
  $("#p1next").click(function() {
    $("#page1").hide();
    $("#page2").show();
  });
  $("#p2prev").click(function() {
    $("#page1").show();
    $("#page2").hide();
  });
  $("#p3prev").click(function() {
    $("#index").show();
    $("#page3").hide();
  });
  $("#p4prev").click(function() {
    $("#index").show();
    $("#page4").hide();
  });
  $("#p5prev").click(function() {
    $("#index").show();
    $("#page5").hide();
  });
  //Calculate Oil Amount
  $("#gas").on('input', function(event, ui) {
    var oilRatio = $("#ratio").val();
    var gasAmount = $("#gas").val();
    if (!isNaN(gasAmount)) {
      var oilAmount = ((gasAmount * 3785.41) / oilRatio).toFixed(0);
      $("#oilamount").html("Add " + oilAmount + "ml of oil to your gas");
    }
  });
  $("#ratio").change(function(event, ui) {
    var gasAmount = $("#gas").val();
    if (!isNaN(gasAmount)) {
      var oilRatio = $("#ratio").val();
      var oilAmount = ((gasAmount * 3785.41) / oilRatio).toFixed(0);
      $("#oilamount").html("Add " + oilAmount + "ml of oil to your gas");
    }
  });
  //Work with JSON Data
  $.getJSON('js/toolbox.json', function(data) {
    //variables
    var calculator = $("#page2");
    var manSelect = $("#manufacturer");
    var modSelect = $("#model");
    var verSelect = $("#version");
    var typSelect = $("#type");
    var fspSelect = $("#fsprocket");
    var rspSelect = $("#rsprocket");
    var whlSelect = $("#wheelsize");
    var tireSelect = $("#tirewidth");
    var calcButton = $("#p1next");
    var fsp, rsp, whl, intRatio, extRatio, rpm, mph, tire, tireCirc;
    var manufacturers = [];
    //calculate tire circumferance

    function tireCalc(whl, tire) {
      tireCirc = ((tire * 2) + whl) * 3.14159;
      return tireCirc;
    }
    //find unique values

    function unique(list) {
      var result = [];
      $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
      });
      return result;
    }
    //CALC RPM

    function calcrpm(intRatio, extRatio, mph, tireCirc) {
      rpm = ((((mph / 60) * 63360) / tireCirc) / extRatio) / intRatio;
      return Math.round(rpm);
    }
    //CALC MPH

    function calcmph(intRatio, extRatio, rpm, tireCirc) {
      mph = ((rpm * intRatio * extRatio * tireCirc) / 63360) * 60;
      return Math.round(mph);
    }
    //load unique manufacturers
    $.each(data, function() {
      manufacturers.push(this.manufacturer);
    });
    manufacturers = unique(manufacturers);
    //Populate first gearing dropdown
    manSelect.append($("<option />").text('Please Select A Manufacturer'));
    $.each(manufacturers.sort(), function() {
      manSelect.append($("<option />").val(this).text(this));
    });
    //Populate second gearing dropdown based on the first
    manSelect.change(function() {
      modSelect.empty();
      var manChoice = $(this);
      var vals = [];
      var key = manChoice.val();
      $(".p1c2").hide();
      $(".p1c4").hide();
      $(".p1c5").hide();
      $(".p1c6").hide();
      $(".p1c7").hide();
      $(".p1c8").hide();
      calcButton.hide();
      calculator.hide();
      if (manChoice.val() == 'Please Select A Manufacturer') {
        $(".p1c2").hide();
        $(".p1c4").hide();
        $(".p1c5").hide();
        $(".p1c6").hide();
        $(".p1c7").hide();
        $(".p1c8").hide();
        calcButton.hide();
        calculator.hide();
      } else if (manChoice.val() == 'Vespa') {
        $("#fsprocket").append($("<option />").val(50).text((50) + "mm Pulley"));
        $("#fsprocket").append($("<option />").val(60).text((60) + "mm Pulley"));
        var i = 10;
        while (++i < 22) {
          $("#rsprocket").append($("<option />").val(i * 5).text((i * 5) + "mm Pulley"));
        }
        $.each(data, function() {
          if (this.manufacturer == manChoice.val()) {
            vals.push(this.model);
          }
        });
        $(".p1c2").show();
      } else {
        var i = 8;
        while (++i < 32) {
          $("#fsprocket").append($("<option />").val(i).text(i + " Tooth"));
        }
        i = 19;
        while (++i < 79) {
          $("#rsprocket").append($("<option />").val(i).text(i + " Tooth"));
        }
        $.each(data, function() {
          if (this.manufacturer == manChoice.val()) {
            vals.push(this.model);
          }
        });
        $(".p1c2").show();
      }
      vals = unique(vals);
      modSelect.append($("<option />").text('Please Select An Engine Model'));
      $.each(vals, function(index, value) {
        modSelect.append($("<option />").val(this).text(this));
      });
    });
    //If a versions exists for the model chosen display them otherwise display remaining choices
    modSelect.change(function() {
      verSelect.empty();
      var modChoice = modSelect.val();
      var manChoice = manSelect.val();
      var vals = [];
      $.each(data, function() {
        if (this.model == modChoice && this.manufacturer == manChoice) {
          vals.push(this.version);
        }
      });
      if (modChoice == 'Please Select An Engine Model') {
        $(".p1c4").hide();
        $(".p1c5").hide();
        $(".p1c6").hide();
        $(".p1c7").hide();
        $(".p1c8").hide();
        calcButton.hide();
        calculator.hide();
      } else if (vals.length > 1) {
        $(".p1c4").show();
        verSelect.append($("<option />").text('Please Select An Engine Version'));
        $.each(vals, function(index, value) {
          verSelect.append($("<option />").val(this).text(this));
        });
        $(".p1c5").hide();
        $(".p1c6").hide();
        $(".p1c7").hide();
        $(".p1c8").hide();
        //Populate remaining defaults based on version
        verSelect.change(function() {
          var verChoice = verSelect.val();
          if (verChoice == 'Please Select An Engine Version') {
            $(".p1c5").hide();
            $(".p1c6").hide();
            $(".p1c7").hide();
            $(".p1c8").hide();
            calcButton.hide();
            calculator.hide();
          } else {
            $.each(data, function() {
              if (this.model == modChoice && this.manufacturer == manChoice && this.version == verChoice) {
                fsp = this.defaultfront;
                rsp = this.defaultrear;
                whl = this.defaultwheel;
                tire = this.defaulttire.toFixed(2);
                intRatio = this.finaldriveratio;
              }
            });
            $(".p1c5").show();
            $(".p1c6").show();
            $(".p1c7").show();
            $(".p1c8").show();
            calcButton.show();
            //Populate default vaules
            fspSelect.val(fsp);
            rspSelect.val(rsp);
            whlSelect.val(whl);
            tireSelect.val(tire);
          }
        });
      } else {
        $.each(data, function() {
          if (this.model == modChoice && this.manufacturer == manChoice) {
            fsp = this.defaultfront;
            rsp = this.defaultrear;
            whl = this.defaultwheel;
            tire = this.defaulttire.toFixed(2);
            intRatio = this.finaldriveratio;
          }
        });
        $(".p1c4").hide();
        //Show remaining dropdowns without version
        $(".p1c5").show();
        $(".p1c6").show();
        $(".p1c7").show();
        $(".p1c8").show();
        calcButton.show();
        //Populate default vaules
        fspSelect.val(fsp);
        rspSelect.val(rsp);
        whlSelect.val(whl);
        tireSelect.val(tire);
      }
    });
    fspSelect.change(function() {
      fsp = fspSelect.val();
    });
    //Button
    calcButton.click(function() {
      $("#page1").hide();
      $("#page2").show();
      fsp = parseInt(fspSelect.val());
      rsp = parseInt(rspSelect.val());
      tire = parseFloat(tireSelect.val()).toFixed(2);
      whl = parseInt(whlSelect.val());
      extRatio = (fsp / rsp);
      tireCirc = tireCalc(whl, tire);
      var finalRatio = (1 / intRatio) * (1 / extRatio);
      mph = 30;
      rpm = calcrpm(intRatio, extRatio, mph, tireCirc);
      $("#currentmph").text(mph);
      $("#currentrpm").text(rpm);
      $("#finalratio").val(finalRatio.toFixed(2) + ":1");
      //MPH Range Input
      $("#mph").attr({
        min: 1,
        max: 100,
        value: mph
      });
      $("#mph").on('input', function(event, ui) {
        mph = this.value;
        rpm = calcrpm(intRatio, extRatio, mph, tireCirc);
        $("#currentmph").text(mph);
        $("#currentrpm").text(rpm);
      });
    });
    //************CARB SIZING************
    var cmanSelect = $("#cmanselect");
    var cmodSelect = $("#cmodselect");
    var pistonSelect = $("#pistonselect");
    var crpm = 7500;
    var strokeHeight = 0;
    var pistonDiameter = 0;
    var minVE = 0.55;
    var maxVE = 1.25;
    //CALC Min Carb -ve should be between .65 and .9

    function calcCarbBore(rpm, diameter, stroke, ve) {
      var radius = diameter / 2;
      var volume = (3.1415 * Math.pow(radius, 2) * stroke);
      var carbBore = ve * Math.sqrt(volume * rpm);
      carbBore = (carbBore / 1000).toFixed(2);
      return carbBore;
    }
    //RPM Range Input
    $("#crpm").attr({
      min: 1,
      max: 15000,
      value: crpm
    });
    $("#dispcrpm").text(crpm);
    $("#cbore").hide();
    $(".p4c2").hide();
    $(".p4c2").hide();
    $(".p4c3").hide();
    $(".p4c4").hide();
    //Populate first dropdown
    cmanSelect.append($("<option />").text('Please Select A Manufacturer'));
    $.each(manufacturers.sort(), function() {
      cmanSelect.append($("<option />").val(this).text(this));
    });
    $("#crpm").on('input', function(event, ui) {
      crpm = this.value;
      $("#dispcrpm").text(crpm);
    });
    //Populate second gearing dropdown based on the first
    cmanSelect.change(function() {
      cmodSelect.empty();
      var cmanChoice = $(this);
      var vals = [];
      var key = cmanChoice.val();
      $(".p4c2").hide();
      $(".p4c3").hide();
      $(".p4c4").hide();
      if (cmanChoice.val() == 'Please Select A Manufacturer') {
        $(".p4c2").hide();
        $(".p4c3").hide();
        $(".p4c4").hide();
      } else {
        $.each(data, function() {
          if (this.manufacturer == cmanChoice.val()) {
            vals.push(this.model)
          }
        });
        $(".p4c2").show();
      }
      vals = unique(vals);
      cmodSelect.append($("<option />").text('Please Select An Engine Model'));
      $.each(vals, function(index, value) {
        cmodSelect.append($("<option />").val(this).text(this));
      });
      cmodSelect.change(function() {
        var cmodChoice = $(this);
        var vals = [];
        var key = cmodChoice.val();
        if (cmodChoice.val() == 'Please Select An Engine Model') {
          $(".p4c3").hide();
          $(".p4c4").hide();
        } else {
          $.each(data, function() {
            if (this.model == cmodChoice.val() && this.manufacturer == cmanChoice.val()) {
              strokeHeight = this.strokelength;
            }
          });
          $(".p4c3").show();
          pistonSelect.change(function() {
            var pistonChoice = $(this);
            if (pistonChoice.val() == 'Please Select A Piston Diameter') {
              $(".p4c4").hide();
            } else {
              pistonDiameter = pistonSelect.val();
              $(".p4c4").show();
              $("#cdisclaimer").hide();
              $("#cbore").show();
              var minCarb = calcCarbBore(crpm, pistonDiameter, strokeHeight, minVE);
              var maxCarb = calcCarbBore(crpm, pistonDiameter, strokeHeight, maxVE);
              $("#mincarbout").text(minCarb + "mm");
              $("#maxcarbout").text(maxCarb + "mm");
            }
          });
          $("#crpm").on('input', function(event, ui) {
            crpm = this.value;
            var minCarb = calcCarbBore(crpm, pistonDiameter, strokeHeight, minVE);
            var maxCarb = calcCarbBore(crpm, pistonDiameter, strokeHeight, maxVE);
            $("#mincarbout").text(minCarb + "mm");
            $("#maxcarbout").text(maxCarb + "mm");
          });
        }
      });
    });
  });
});
