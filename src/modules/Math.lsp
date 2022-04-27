(def square (x) 
    (* x x))

(def factorial (x)
    (if (= x 1)
        1
        (* x (factorial (- x 1)))
    )
)  

(var PI 3.14159)