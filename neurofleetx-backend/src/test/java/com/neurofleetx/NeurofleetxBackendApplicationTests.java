package com.neurofleetx;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class NeurofleetxBackendApplicationTests {

	@Test
	void contextLoads() {
		// Context loads with test profile (H2 in-memory DB)
	}

}
