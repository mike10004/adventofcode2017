package main

import (
	"strconv"
	"strings"
	"errors"
	"fmt"
	"os"
	"io/ioutil"
)

const (
	// MaxUint is max unsigned int
	MaxUint = ^uint(0)
	// MinUint is min unsigned int
	MinUint = 0
	// MaxInt is max int
	MaxInt = int(MaxUint >> 1)
	// MinInt is min int
	MinInt = -MaxInt - 1
)

// Min returns the smaller one
func Min(x, y int) int {
	if x < y {
		return x
	}
	return y
}

// Max returns the bigger one
func Max(x, y int) int {
	if x > y {
		return x
	}
	return y
}

func min(numbers []int) (int, error) {
	if len(numbers) == 0 {
		return 0, errors.New("cannot get minimum of empty array")
	}
	min := MaxInt
	for i := 0; i < len(numbers); i++ {
		min = Min(min, numbers[i])
	}
	return min, nil
}

func max(numbers []int) (int, error) {
	if len(numbers) == 0 {
		return 0, errors.New("cannot get minimum of empty array")
	}
	max := MinInt
	for i := 0; i < len(numbers); i++ {
		max = Max(max, numbers[i])
	}
	return max, nil
}

// Bounds represents a minimum and maximum value (inclusive)
type Bounds struct {
	MIN int
	MAX int
}

func bounds(numbers []int) (Bounds, error) {
	if len(numbers) == 0 {
		return Bounds{0, 0}, errors.New("numbers array must be nonempty to get bounds")
	}
	max, _ := max(numbers)
	min, _ := min(numbers)
	return Bounds{min, max}, nil
}

func parseLine(line string) ([]int, error) {
	tokens := strings.Fields(line)
	numbers := make([]int, len(tokens))
	for i := 0; i < len(tokens); i++ {
		val, err := strconv.Atoi(tokens[i])
		if err != nil {
			return nil, errors.New("parse failure")
		}
		numbers[i] = val
	}
	return numbers, nil
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
		numbers, err := parseLine(lines[i])
		if err != nil {
			fmt.Fprintln(os.Stderr, err, lines[i])
			os.Exit(1)
		}
		if len(numbers) > 0 {
			bounds, _ := bounds(numbers)
			checksum += (bounds.MAX - bounds.MIN)
		}
	}
	fmt.Println("checksum", checksum)
	os.Exit(0)
}
