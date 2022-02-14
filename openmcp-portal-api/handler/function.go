package handler

import (
	"fmt"
	"math"
	"reflect"
	"strconv"
)

func FindInStrArr(slice []string, val string) bool {
	for _, item := range slice {
		if item == val {
			return true
		}
	}
	return false
}

func FindInInterfaceArr(slice []interface{}, val string) bool {
	for _, item := range slice {
		if item == val {
			return true
		}
	}
	return false
}

func Round(x, unit float64) float64 {
	return math.Round(x/unit) * unit
}

func PercentChange(child, mother float64) (result float64) {
	// diff := float64(new - old)
	result = (float64(child) / float64(mother)) * 100
	return
}

func PercentUseString(child, mother string) (result string) {
	c, _ := strconv.ParseFloat(child, 64)
	m, _ := strconv.ParseFloat(mother, 64)

	if m == 0 || c == 0 {
		return "0.0"
	}
	res := (c / m) * 100
	result = fmt.Sprintf("%.1f", res)
	return
}

func sliceRemoveItem(slicep interface{}, i int) {
	v := reflect.ValueOf(slicep).Elem()
	v.Set(reflect.AppendSlice(v.Slice(0, i), v.Slice(i+1, v.Len())))
}
