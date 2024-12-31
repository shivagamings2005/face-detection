Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "http://127.0.0.1:5000/classify_image",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Drop files here or click to upload",
        autoProcessQueue: false,
        createImageThumbnails: true,
        init: function() {
            this.on("addedfile", function(file) {
                if (this.files.length > 1) {
                    this.removeFile(this.files[0]);
                }
            });
        }
    });
    
    dz.on("addedfile", function(file) {
        console.log("File added");
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function() {
            file.dataURL = reader.result;
            console.log("File converted to base64");
        };
    });

    dz.on("complete", function(file) {
        if (!file.dataURL) {
            console.error("No data URL available");
            return;
        }

        console.log("Sending data URL:", file.dataURL.substring(0, 50) + "...");

        const formData = new FormData();
        formData.append('image_data', file.dataURL);

        fetch("http://127.0.0.1:5000/classify_image", {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Server response:", data);
            if (!data || data.length == 0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();                
                $("#error").show();
                return;
            }
            
            let match = null;
            let bestScore = -1;
            for (let i = 0; i < data.length; ++i) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if(maxScoreForThisClass > bestScore) {
                    match = data[i];
                    bestScore = maxScoreForThisClass;
                }
            }
            
            if (match) {
                $("#error").hide();
                $("#resultHolder").show();
                $("#divClassTable").show();
                $("#resultHolder").html($(`[data-player="${match.class}"]`).html());
                
                // Clear previous scores
                $("#score_Benedict Cumberbatch").html("");
                $("#score_chris hemsworth").html("");
                $("#score_emma myers").html("");
                $("#score_pepper potts").html("");
                $("#score_robert downey jr").html("");

                // Update probabilities
                let classDictionary = match.class_dictionary;
                for(let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let probabilityScore = match.class_probability[index];
                    
                    // Format the score to 2 decimal places
                    probabilityScore = probabilityScore.toFixed(2) + "%";
                    
                    // Log the attempt to update the score
                    console.log(`Updating score for ${personName}: ${probabilityScore}`);
                    console.log(`Looking for element with id: score_${personName}`);
                    
                    // Try to find the element and update it
                    let element = document.getElementById(`score_${personName}`);
                    if (element) {
                        element.innerHTML = probabilityScore;
                    } else {
                        console.error(`Could not find element with id: score_${personName}`);
                    }
                }
            }
        })
        .catch(error => {
            console.error("Error:", error);
            $("#error").show();
            $("#resultHolder").hide();
            $("#divClassTable").hide();
        });
    });

    $("#submitBtn").on('click', function(e) {
        e.preventDefault();
        if (dz.files.length) {
            dz.processQueue();
        } else {
            console.log("No files to process");
        }
    });
}

$(document).ready(function() {
    console.log("ready!");
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();
    init();
});