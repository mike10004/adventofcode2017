package main

import (
	"strconv"
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
	for i := 0; i < len(numbers); i++ {
		for j := 0; j < len(numbers); j++ {
			if i != j {
				if (numbers[i] % numbers[j]) == 0 {
					return Quotient{Max(numbers[i], numbers[j]), Min(numbers[i], numbers[j])}, nil
				}
			}
		}
	}
	return Quotient{0, 0}, errors.New("no divisible numbers out of array of length " + strconv.Itoa(len(numbers)))
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
		if len(numbers) > 0 {
			quotient, err := findDivisible(numbers)
			if err != nil {
				fmt.Fprintln(os.Stderr, err);
				os.Exit(1)
			}
			checksum += (quotient.Numerator / quotient.Denominator)
		}
	}
	fmt.Println("checksum", checksum)
	os.Exit(0)
}
