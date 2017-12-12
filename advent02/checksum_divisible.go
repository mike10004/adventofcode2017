package main

import (
	"strings"
	"errors"
	"fmt"
	"os"
	"io/ioutil"
)

// Quotient represents a numerator and denominator
type Quotient struct {
	Numerator int
	Denominator int
}

func findDivisible(numbers []int) (Quotient, error) {
	numerator := -1
	denominator := -1
	if numerator == -1 || denominator == -1 {
		return Quotient{0, 0}, errors.New("divisible values not found in numbers array")
	}
	return Quotient{numerator, denominator}, nil
}

func main() {
	filename := "./input.txt"
	if len(os.Args) > 1 {
		filename = os.Args[1]
		fmt.Fprintln(os.Stderr, "reading from file", filename)
	}
	dat, err := ioutil.ReadFile(filename)
	if err != nil {
		fmt.Fprintln(os.Stderr, "error reading file", err)
		os.Exit(1);
	}
	text := string(dat)
	lines := strings.Split(text, "\n")
	checksum := 0
	for i := 0; i < len(lines); i++ {
		numbers, err := ParseLine(lines[i])
		if err != nil {
			fmt.Fprintln(os.Stderr, err, lines[i])
			os.Exit(1)
		}
		quotient, err := findDivisible(numbers)
		if err != nil {
			fmt.Fprintln(os.Stderr, err);
			os.Exit(1)
		}
		checksum += (quotient.Numerator / quotient.Denominator)
	}
	fmt.Println("checksum", checksum)
	os.Exit(0)
}
