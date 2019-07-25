# 2048
2048 made with Javascript and CSS
## Goals
This was my *first* attempt at using JavaScript to make something more advanced than just changing CSS on page loads [so please don't judge me too harshly :)]. As such, my goal with this project wasn't anything too extreme-- really just to get myself comfortable with JavaScript and CSS, primarily: 
- dealing with user-generated events 
- CSS transitions
- synchronizing between model and view
- extensive DOM manipulation
- cookies
- asynchronous functions (Promises)
## On what can be improved
Unfortunately, the transitions are a bit unreliable, due in part to the fact that I used them in ways that were not really intended. For instance, on the 4x4, you can have ~30 transitions fired in close proximity. Due to this, if I were to make significant changes to the animations, it would probably have to be done via the `canvas` element of HTML5. That being said, there are improvements that can be made for the future, in increasing difficulty to implement
- I can add sounds for movement
- I scrapped together the 2048 algorithm after having completed a Kattis problem. As such, it could probably be optimized (though it *did* pass the Kattis time limit...)
