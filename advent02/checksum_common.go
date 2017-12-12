package main

import (
  "strconv"
	"strings"
	"errors"
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

// ParseLine parses a line of integer tokens and returns an integer array
func ParseLine(line string) ([]int, error) {
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
